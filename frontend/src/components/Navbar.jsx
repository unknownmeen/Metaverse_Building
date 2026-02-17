import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Sun, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { t } from '../services/i18n';

const navItems = [
  { path: '/coming-soon', labelKey: 'nav.dar_mahzar', icon: Sun, badgeKey: 'nav.coming_soon' },
  { path: '/projects', labelKey: 'nav.project_management', icon: Map },
  { path: '/profile', labelKey: 'nav.profile', icon: UserCircle },
];

export default function Navbar() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);
  const userAvatar = state.user?.avatar;
  const isProfilePage = location.pathname === '/profile';

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const currentIcon = navItems.find(i => i.path === location.pathname)?.icon || Map;
  const CurrentIcon = currentIcon;

  return (
    <div ref={ref} className="relative z-50">
      {/* Collapsed: single round button — show user avatar on profile page */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm overflow-hidden',
          open
            ? 'bg-slate-200 text-slate-600'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        )}
      >
        {isProfilePage && userAvatar ? (
          <img src={userAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <CurrentIcon className="w-5 h-5" />
        )}
      </button>

      {/* Expanded: vertical pill menu */}
      {open && (
        <div className="absolute top-14 right-0 bg-slate-100 rounded-[1.75rem] p-2 flex flex-col items-center gap-1 shadow-lg border border-slate-200 animate-scale-in">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all relative group overflow-hidden',
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-400 hover:bg-white hover:text-slate-600'
                )}
                title={t(item.labelKey)}
              >
                {item.path === '/profile' && userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
                {/* Tooltip — opens to the left (start side in RTL) */}
                <span className="absolute right-full ml-3 bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {t(item.labelKey)}
                  {item.badgeKey && <span className="mr-1 text-amber-300">({t(item.badgeKey)})</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
