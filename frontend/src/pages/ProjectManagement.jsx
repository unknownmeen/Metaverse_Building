import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductBox from '../components/ProductBox';
import ProductInfoDrawer from '../components/ProductInfoDrawer';
import CreateSubProductDrawer from '../components/CreateSubProductDrawer';
import CreateMissionDrawer from '../components/CreateMissionDrawer';
import MissionDetailDrawer from '../components/MissionDetailDrawer';
import UserAvatar from '../components/UserAvatar';
import { FolderOpen, MoreHorizontal, Info, FolderPlus, ListPlus } from 'lucide-react';
import { t } from '../services/i18n';

export default function ProjectManagement() {
  const { getCurrentProduct, state, dispatch } = useApp();
  const [showProductMenu, setShowProductMenu] = useState(false);
  const currentProduct = getCurrentProduct();

  if (!currentProduct) return null;

  const children = currentProduct.children || [];
  const subProducts = children.filter(c => c.type === 'product');

  const handleProductInfo = () => {
    dispatch({ type: 'OPEN_PRODUCT_INFO_DRAWER', product: currentProduct });
    setShowProductMenu(false);
  };

  const handleCreateSubProduct = () => {
    dispatch({ type: 'OPEN_CREATE_SUB_PRODUCT', parentId: currentProduct.id });
    setShowProductMenu(false);
  };

  const handleCreateMission = () => {
    dispatch({ type: 'OPEN_CREATE_MISSION', parentId: currentProduct.id });
    setShowProductMenu(false);
  };

  return (
    <>
      <div key={state.currentProductId} className="px-4 py-5 zoom-enter relative">
        {/* Page Header */}
        <div className="mb-5 text-right">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h1 className="text-lg font-black text-slate-800 flex-1">{currentProduct.title}</h1>
            <div className="relative flex-shrink-0" style={{ zIndex: showProductMenu ? 60 : 10 }}>
              <button
                onClick={() => setShowProductMenu(!showProductMenu)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary-500 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showProductMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 55 }} onClick={() => setShowProductMenu(false)} />
                  <div
                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in"
                    style={{ zIndex: 56 }}
                  >
                    <button
                      onClick={handleProductInfo}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-500" />
                      {t('product.info')}
                    </button>
                    {state.isAdmin && (
                      <>
                        <div className="border-t border-slate-100" />
                        <button
                          onClick={handleCreateSubProduct}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <FolderPlus className="w-4 h-4 text-emerald-500" />
                          {t('product.create_sub')}
                        </button>
                        <button
                          onClick={handleCreateMission}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ListPlus className="w-4 h-4 text-amber-500" />
                          {t('mission.create')}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {currentProduct.description && (
            <p className="text-xs text-slate-500 leading-relaxed">{currentProduct.description}</p>
          )}
        </div>

        {subProducts.length === 0 && children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">{t('project.empty_title')}</h3>
            <p className="text-sm text-slate-400">
              {t('project.empty_description')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children.map((child) =>
              child.type === 'product' ? (
                <ProductBox key={child.id} product={child} depth={0} />
              ) : null
            )}
            {/* If current product has direct missions, show them in a container */}
            {children.some(c => c.type === 'mission') && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-white/40">
                <h3 className="text-[15px] font-bold text-slate-600 mb-3 text-right">{t('mission.missions')}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {children.filter(c => c.type === 'mission').map(mission => (
                    <MissionInlineCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawers */}
      <ProductInfoDrawer />
      <CreateSubProductDrawer />
      <CreateMissionDrawer />
      <MissionDetailDrawer />
    </>
  );
}

function MissionInlineCard({ mission }) {
  const { dispatch, getUserById } = useApp();
  const assignee = getUserById(mission.assignee);
  const statusColors = {
    pending: '#94a3b8', in_progress: '#3b82f6', judging: '#eab308',
    needs_fix: '#ef4444', done: '#22c55e',
  };
  const color = statusColors[mission.status] || '#94a3b8';

  return (
    <div
      onClick={() => dispatch({ type: 'OPEN_MISSION_DRAWER', mission })}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-sm group flex"
      style={{ backgroundColor: color + '12' }}
    >
      {/* Color stripe on the left */}
      <div
        className="w-2 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="p-3 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-primary-600 transition-colors">
            {mission.title}
          </span>
          <span
            className="text-[10px] font-semibold flex-shrink-0"
            style={{ color }}
          >
            {t(`status.mission.${mission.status}`)}
          </span>
        </div>
        {assignee && (
          <div className="flex items-center gap-1.5">
            <UserAvatar src={assignee.avatar} className="w-4 h-4" />
            <span className="text-[11px] text-slate-500">{assignee.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
