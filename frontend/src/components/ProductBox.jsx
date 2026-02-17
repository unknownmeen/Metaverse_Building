import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, Maximize2, FolderPlus, ListPlus, MoreHorizontal, Trash2, FolderOpen } from 'lucide-react';

const PRODUCT_BOX_ICON = '/product-box-icon.png';
import { useMutation } from '@apollo/client/react';
import { useApp } from '../context/AppContext';
import { DELETE_PRODUCT } from '../graphql/mutations';
import { toastService } from '../services/toastService';
import { cn } from '../lib/utils';
import { t } from '../services/i18n';
import { toPersianDigits } from '../lib/persianNumbers';

const statusColors = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  judging: '#eab308',
  needs_fix: '#ef4444',
  done: '#22c55e',
};

/** عمق نمایش کامل: تا این عمق باکس‌های تو در تو نشان داده می‌شوند. بعد از آن به صورت +N جمع می‌شوند */
const DISPLAY_COLLAPSE_DEPTH = 4;
const MAX_COLLAPSED_ITEMS = 4;

function InlineMissionCard({ mission }) {
  const { dispatch, getUserById } = useApp();
  const assignee = getUserById(mission.assignee);
  const color = statusColors[mission.status] || '#94a3b8';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_MISSION_DRAWER', mission });
      }}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-sm group/mission flex"
      style={{ backgroundColor: color + '12' }}
    >
      <div
        className="w-2 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="p-3 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-700 truncate group-hover/mission:text-primary-600 transition-colors">
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
            <img src={assignee.avatar} alt="" className="w-4 h-4 rounded-full" />
            <span className="text-[11px] text-slate-500">{assignee.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsedChildrenTags({ children, dispatch }) {
  const [expanded, setExpanded] = useState(false);
  const products = children.filter(c => c.type === 'product');
  const missions = children.filter(c => c.type === 'mission');
  const all = [...products, ...missions];
  const visible = expanded ? all : all.slice(0, MAX_COLLAPSED_ITEMS);
  const remaining = all.length - MAX_COLLAPSED_ITEMS;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {visible.map((child) =>
        child.type === 'product' ? (
          <span
            key={child.id}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'NAVIGATE_TO_PRODUCT', productId: child.id });
            }}
            className="text-[11px] bg-primary-50 text-primary-500 px-2 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer hover:bg-primary-100 transition-colors"
          >
            <img src={PRODUCT_BOX_ICON} alt="" className="w-3 h-3 flex-shrink-0 object-contain" />
            <span className="truncate max-w-[100px]">{child.title}</span>
            {child.children && child.children.length > 0 && (
              <span className="text-[9px] bg-primary-200/60 text-primary-600 px-1 rounded-md font-bold min-w-[16px] text-center">
                +{toPersianDigits(child.children.filter(c => c.type === 'product').length || child.children.length)}
              </span>
            )}
          </span>
        ) : (
          <span
            key={child.id}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'OPEN_MISSION_DRAWER', mission: child });
            }}
            className="text-[11px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-medium cursor-pointer hover:bg-slate-100 flex items-center gap-1 transition-colors"
          >
            <span
              className="w-1.5 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: statusColors[child.status] || '#94a3b8' }}
            />
            <span className="truncate max-w-[100px]">{child.title}</span>
          </span>
        )
      )}
      {!expanded && remaining > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="text-[11px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <MoreHorizontal className="w-3 h-3" />
          +{toPersianDigits(remaining)}
        </button>
      )}
      {expanded && all.length > MAX_COLLAPSED_ITEMS && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
          className="text-[11px] bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg font-semibold hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
          {t('common.collapse')}
        </button>
      )}
    </div>
  );
}

export default function ProductBox({ product, depth = 0 }) {
  const { state, dispatch, refreshProducts } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT);

  const children = product.children || [];
  const d = Math.min(depth, 3);

  const handleNavigate = (e) => {
    e.stopPropagation();
    dispatch({ type: 'NAVIGATE_TO_PRODUCT', productId: product.id });
  };

  const handleInfo = (e) => {
    e.stopPropagation();
    dispatch({ type: 'OPEN_PRODUCT_INFO_DRAWER', product });
    setShowMenu(false);
  };

  const handleCreateSubProduct = (e) => {
    e.stopPropagation();
    dispatch({ type: 'OPEN_CREATE_SUB_PRODUCT', parentId: product.id });
    setShowMenu(false);
  };

  const handleCreateMission = (e) => {
    e.stopPropagation();
    dispatch({ type: 'OPEN_CREATE_MISSION', parentId: product.id });
    setShowMenu(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const isRoot = !product.parentId;
    if (isRoot) {
      toastService.error(t('errors.product.delete_root'));
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct({ variables: { id: product.id } });
      setShowDeleteConfirm(false);
      await refreshProducts();
      toastService.success(t('success.product_deleted'));
    } catch {
      toastService.error(t('errors.product.delete_failed'));
    }
  };

  useEffect(() => {
    if (showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDeleteConfirm]);

  const sizeStyles = {
    0: 'p-5 min-h-[220px]',
    1: 'p-4 min-h-[140px]',
    2: 'p-3 min-h-[90px]',
    3: 'p-2.5 min-h-[60px]',
  };

  const borderStyles = {
    0: 'border-slate-300 bg-white/60',
    1: 'border-slate-200/80 bg-white/40',
    2: 'border-slate-200/60 bg-white/30',
    3: 'border-slate-200/40 bg-white/20',
  };

  const titleStyles = {
    0: 'text-[15px]',
    1: 'text-[13px]',
    2: 'text-xs',
    3: 'text-[11px]',
  };

  const iconSize = {
    0: 'w-4 h-4',
    1: 'w-3.5 h-3.5',
    2: 'w-3 h-3',
    3: 'w-3 h-3',
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl relative transition-all product-box-enter cursor-pointer group hover:border-primary-300/60 flex flex-col',
        sizeStyles[d],
        borderStyles[d]
      )}
      onClick={handleNavigate}
    >
      {/* Header: title+icon on RIGHT, info button on LEFT (RTL) */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        {/* Product Title + Box icon — first child = RIGHT in RTL */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img src={PRODUCT_BOX_ICON} alt="" className={cn('flex-shrink-0 object-contain', iconSize[d])} />
          <h3
            className={cn(
              'font-bold text-slate-700 transition-colors group-hover:text-primary-600 truncate',
              titleStyles[d]
            )}
          >
            {product.title}
          </h3>
          {children.length > 0 && depth >= DISPLAY_COLLAPSE_DEPTH && (
            <span className="text-[10px] bg-slate-200/80 text-slate-500 px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">
              {children.filter(c => c.type === 'product').length > 0
                ? `${toPersianDigits(children.filter(c => c.type === 'product').length)} ▾`
                : toPersianDigits(children.length)
              }
            </span>
          )}
        </div>

        {/* Three-dot menu — last child = LEFT in RTL */}
        <div className="relative flex-shrink-0" style={{ zIndex: showMenu ? 60 : 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={cn(
              'flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all p-1',
              depth === 0 ? 'w-9 h-9' : depth <= 2 ? 'w-7 h-7' : 'w-6 h-6'
            )}
          >
            <MoreHorizontal className={cn('w-5 h-5', depth > 0 && 'w-4 h-4')} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0" style={{ zIndex: 55 }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in" style={{ zIndex: 56 }}>
                <button
                  onClick={handleNavigate}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-primary-500" />
                  {t('product.zoom')}
                </button>
                <button
                  onClick={handleInfo}
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
                    <div className="border-t border-slate-100" />
                    <button
                      onClick={handleDeleteClick}
                      disabled={deleting || !product.parentId}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('product.delete')}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children: nested products and missions */}
      {children.length > 0 && depth < DISPLAY_COLLAPSE_DEPTH ? (
        <div
          className={cn(
            'grid gap-3',
            depth === 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          )}
        >
          {children.map((child) =>
            child.type === 'product' ? (
              <ProductBox key={child.id} product={child} depth={depth + 1} />
            ) : (
              <InlineMissionCard key={child.id} mission={child} />
            )
          )}
        </div>
      ) : children.length > 0 ? (
        <CollapsedChildrenTags children={children} dispatch={dispatch} />
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[60px]">
          <FolderOpen className="w-6 h-6 text-slate-200" />
        </div>
      )}

      {/* Delete Confirmation Modal — rendered in body, centered in viewport */}
      {showDeleteConfirm && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          dir="rtl"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!deleting && e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="p-6">
              <h4 className="text-lg font-bold text-slate-800 text-center mb-3">
                {t('product.delete_confirm_title')}
              </h4>
              <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
                {t('product.delete_confirm')}
              </p>
              <div className="flex gap-3 flex-row-reverse">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {deleting ? t('common.submitting') : t('product.delete_action')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-70 border border-slate-200"
                >
                  {t('common.cancel_short')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
