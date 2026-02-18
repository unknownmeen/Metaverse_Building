import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle, ChevronLeft } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { useApp } from '../context/AppContext';
import { MARK_NOTIFICATION_READ as MARK_READ_MUTATION } from '../graphql/mutations';
import { MISSION_STATUS } from '../data/mockData';
import { t } from '../services/i18n';
import { toPersianDigits } from '../lib/persianNumbers';
import Navbar from './Navbar';

function NotificationDropdown({ open, onClose }) {
  const { state, dispatch, getMissionById, getProductContainingMission } = useApp();
  const ref = useRef(null);
  const [markRead] = useMutation(MARK_READ_MUTATION);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'chat': return '💬';
      case 'approval': return '✅';
      case 'assignment': return '👤';
      case 'fix': return '🔧';
      default: return '🔔';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', id: notification.id });
      try {
        await markRead({ variables: { id: notification.id } });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    onClose();

    if (!notification.missionId) return;
    const mission = getMissionById(notification.missionId);
    const product = getProductContainingMission(notification.missionId);
    if (mission && product) {
      dispatch({ type: 'NAVIGATE_TO_PRODUCT', productId: product.id });
      dispatch({ type: 'OPEN_MISSION_DRAWER', mission, stepId: notification.stepId });
    }
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in z-50"
    >
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-l from-primary-50 to-white">
        <h3 className="font-bold text-slate-800 text-right">{t('notifications.title')}</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {state.notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">{t('notifications.empty')}</div>
        ) : (
          state.notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-primary-50/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{getIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed text-right ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                    {notification.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 text-right">{notification.time}</p>
                </div>
                {!notification.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HelpModal({ open, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in z-50">
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-l from-amber-50 to-white">
        <h3 className="font-bold text-slate-800 text-right">{t('help.color_guide')}</h3>
      </div>
      <div className="p-4 space-y-3">
        {Object.values(MISSION_STATUS).map((status) => (
          <div key={status.key} className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
            <span className="text-sm text-slate-700">{t(`status.mission.${status.key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopBar() {
  const { state, dispatch, unreadCount } = useApp();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const showBreadcrumb = location.pathname === '/projects';

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Navbar />

          {showBreadcrumb && (
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
              {state.breadcrumb.map((item, index) => (
                <div key={item.id} className="flex items-center gap-1 flex-shrink-0">
                  {index > 0 && <ChevronLeft className="w-4 h-4 text-slate-300" />}
                  <button
                    onClick={() => dispatch({ type: 'NAVIGATE_BREADCRUMB', productId: item.id })}
                    className={`text-sm whitespace-nowrap px-2 py-1 rounded-lg transition-colors text-right ${
                      index === state.breadcrumb.length - 1
                        ? 'font-bold text-primary-600 bg-primary-50'
                        : 'text-slate-500 hover:text-primary-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.title}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => {
                setShowHelp(!showHelp);
                setShowNotif(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                setShowHelp(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {toPersianDigits(unreadCount)}
                </span>
              )}
            </button>
            <NotificationDropdown open={showNotif} onClose={() => setShowNotif(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
