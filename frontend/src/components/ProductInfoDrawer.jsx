import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import Drawer from './Drawer';
import AttachmentSection from './AttachmentSection';
import { useApp } from '../context/AppContext';
import { UPDATE_PRODUCT, DELETE_PRODUCT } from '../graphql/mutations';
import { toastService } from '../services/toastService';
import { t } from '../services/i18n';

export default function ProductInfoDrawer() {
  const { state, dispatch, refreshProducts } = useApp();
  const product = state.selectedProductForInfo;

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [updateProduct, { loading: saving }] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT);

  useEffect(() => {
    if (product) {
      setEditTitle(product.title || '');
      setEditDescription(product.description || '');
      setError('');
      setEditMode(false);
    }
  }, [product]);

  useEffect(() => {
    if (!state.showProductInfoDrawer) setEditMode(false);
  }, [state.showProductInfoDrawer]);

  useEffect(() => {
    if (showDeleteConfirm) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [showDeleteConfirm]);

  if (!product) return null;

  const handleSave = async () => {
    if (saving) return;
    try {
      setError('');
      await updateProduct({
        variables: {
          id: product.id,
          input: {
            title: editTitle,
            description: editDescription,
          },
        },
      });
      await refreshProducts();
      dispatch({ type: 'CLOSE_PRODUCT_INFO_DRAWER' });
    } catch (err) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        t('errors.product.save_failed');
      setError(message);
    }
  };

  const handleDelete = async () => {
    if (deleting || !product?.id || !product?.parentId) return;
    try {
      await deleteProduct({ variables: { id: product.id } });
      setShowDeleteConfirm(false);
      dispatch({ type: 'CLOSE_PRODUCT_INFO_DRAWER' });
      await refreshProducts();
      dispatch({ type: 'NAVIGATE_TO_PRODUCT', productId: product.parentId });
      toastService.success(t('success.product_deleted'));
    } catch {
      toastService.error(t('errors.product.delete_failed'));
    }
  };

  return (
    <Drawer
      open={state.showProductInfoDrawer}
      onClose={() => dispatch({ type: 'CLOSE_PRODUCT_INFO_DRAWER' })}
      title={t('product.info')}
      headerActions={
        state.isAdmin && editMode && product.parentId ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={saving || deleting}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
            title={t('product.delete')}
          >
            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        ) : null
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('product.title_label')}</label>
            {editMode ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl">{product.title}</p>
            )}
          </div>
          {state.isAdmin && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-colors mt-6"
              title={t('common.edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('common.description')}</label>
          {editMode ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all resize-none leading-relaxed"
            />
          ) : (
            <p className="text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl leading-relaxed">
              {product.description || t('common.no_description')}
            </p>
          )}
        </div>

        {/* Attachments */}
        <AttachmentSection productId={product.id} readOnly={!editMode} />

        {editMode && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save_changes')
              )}
            </button>
            <button
              onClick={() => setEditMode(false)}
              disabled={saving}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-70"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            dir="rtl"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!deleting && event.target === event.currentTarget) setShowDeleteConfirm(false);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
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
                    onClick={handleDelete}
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
    </Drawer>
  );
}
