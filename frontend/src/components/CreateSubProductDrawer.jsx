import { useState, useRef } from 'react';
import { Paperclip, LinkIcon, Plus, Loader2, FileText, Trash2, X } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import Drawer from './Drawer';
import { useApp } from '../context/AppContext';
import { CREATE_PRODUCT, CREATE_ATTACHMENT } from '../graphql/mutations';
import { uploadFile, isValidUrl } from '../services/uploadService';
import { t } from '../services/i18n';
import { LIMITS, charsRemaining } from '../lib/validation';

export default function CreateSubProductDrawer() {
  const { state, dispatch, refreshProducts } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkError, setLinkError] = useState('');
  const fileInputRef = useRef(null);

  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [createAttachment] = useMutation(CREATE_ATTACHMENT);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadFile(file);
      setPendingAttachments(prev => [...prev, { name: file.name, url: result.url, type: 'FILE' }]);
    } catch {
      setError(t('common.upload_error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = () => {
    setLinkError('');
    if (!linkUrl.trim()) { setLinkError(t('common.enter_link')); return; }
    if (!isValidUrl(linkUrl.trim())) { setLinkError(t('common.invalid_url')); return; }
    setPendingAttachments(prev => [...prev, { name: linkName.trim() || linkUrl.trim(), url: linkUrl.trim(), type: 'LINK' }]);
    setLinkUrl(''); setLinkName(''); setShowLinkModal(false);
  };

  const removePending = (index) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError('');

      const { data } = await createProduct({
        variables: {
          input: {
            title,
            description: description || '',
            parentId: state.drawerParentProductId,
          },
        },
      });

      if (data?.createProduct?.id && pendingAttachments.length > 0) {
        for (const att of pendingAttachments) {
          await createAttachment({
            variables: {
              input: {
                name: att.name,
                url: att.url,
                type: att.type,
                productId: data.createProduct.id,
              },
            },
          });
        }
      }

      setTitle('');
      setDescription('');
      setPendingAttachments([]);
      await refreshProducts();
      dispatch({ type: 'CLOSE_CREATE_SUB_PRODUCT' });
    } catch (err) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        t('errors.product.create_failed');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={state.showCreateSubProductDrawer}
      onClose={() => dispatch({ type: 'CLOSE_CREATE_SUB_PRODUCT' })}
      title={t('product.create_sub')}
    >
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('product.title_required_label')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.TITLE_MAX))}
            placeholder={t('product.title_placeholder')}
            maxLength={LIMITS.TITLE_MAX}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
            disabled={submitting}
          />
          {title.length > LIMITS.TITLE_MAX * 0.8 && (
            <span className={`text-[10px] mt-1 block text-left ${charsRemaining(title, LIMITS.TITLE_MAX) < 0 ? 'text-red-500' : 'text-slate-400'}`} dir="ltr">
              {charsRemaining(title, LIMITS.TITLE_MAX)}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('product.description_label')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, LIMITS.DESCRIPTION_MAX))}
            placeholder={t('product.description_placeholder')}
            maxLength={LIMITS.DESCRIPTION_MAX}
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all resize-none placeholder:text-slate-300 leading-relaxed"
            disabled={submitting}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">{t('product.documents')}</label>
          <div className="space-y-2">
            {pendingAttachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                {att.type === 'FILE' ? (
                  <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                ) : (
                  <LinkIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                )}
                <span className="text-sm text-slate-700 flex-1 truncate">{att.name}</span>
                <button onClick={() => removePending(idx)} className="p-1 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors bg-slate-50/50 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                {uploading ? t('common.uploading') : t('common.upload_file')}
              </button>
              <button
                onClick={() => setShowLinkModal(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-colors bg-slate-50/50 disabled:opacity-50"
              >
                <LinkIcon className="w-5 h-5" />
                {t('common.add_link')}
              </button>
            </div>
          </div>
        </div>

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-80 p-5 mx-4 animate-scale-in" dir="rtl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex-1 text-center">{t('common.add_link')}</h4>
                <button onClick={() => { setShowLinkModal(false); setLinkError(''); setLinkUrl(''); setLinkName(''); }} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder={t('common.link_placeholder_example')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all placeholder:text-slate-400" dir="ltr" />
                <input type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder={t('common.link_name')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all placeholder:text-slate-400" />
                {linkError && <p className="text-xs text-red-500 text-center">{linkError}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={handleAddLink} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center">{t('common.confirm')}</button>
                  <button onClick={() => { setShowLinkModal(false); setLinkError(''); setLinkUrl(''); setLinkName(''); }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center">{t('common.cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('common.creating')}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              {t('product.create')}
            </>
          )}
        </button>
      </div>
    </Drawer>
  );
}
