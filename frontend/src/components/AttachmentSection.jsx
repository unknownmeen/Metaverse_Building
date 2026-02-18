import { useState, useRef } from 'react';
import { FileText, Link as LinkIcon, Paperclip, Trash2, Loader2, X, ExternalLink, Download } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_ATTACHMENT, DELETE_ATTACHMENT } from '../graphql/mutations';
import { GET_ATTACHMENTS_BY_PRODUCT, GET_ATTACHMENTS_BY_MISSION } from '../graphql/queries';
import { uploadFile, isValidUrl } from '../services/uploadService';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export default function AttachmentSection({ productId, missionId, readOnly = false }) {
  const { state } = useApp();
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkError, setLinkError] = useState('');
  const fileInputRef = useRef(null);

  const query = productId ? GET_ATTACHMENTS_BY_PRODUCT : GET_ATTACHMENTS_BY_MISSION;
  const variables = productId ? { productId } : { missionId };

  const { data, refetch } = useQuery(query, {
    variables,
    skip: !productId && !missionId,
  });

  const [createAttachment] = useMutation(CREATE_ATTACHMENT);
  const [deleteAttachment] = useMutation(DELETE_ATTACHMENT);

  const attachments = productId
    ? data?.attachmentsByProduct || []
    : data?.attachmentsByMission || [];

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadFile(file);

      await createAttachment({
        variables: {
          input: {
            name: file.name,
            url: result.url,
            type: 'FILE',
            ...(productId ? { productId } : {}),
            ...(missionId ? { missionId } : {}),
          },
        },
      });

      await refetch();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = async () => {
    setLinkError('');

    if (!linkUrl.trim()) {
      setLinkError(t('common.enter_link'));
      return;
    }

    if (!isValidUrl(linkUrl.trim())) {
      setLinkError(t('common.invalid_url'));
      return;
    }

    try {
      setUploading(true);
      await createAttachment({
        variables: {
          input: {
            name: linkName.trim() || linkUrl.trim(),
            url: linkUrl.trim(),
            type: 'LINK',
            ...(productId ? { productId } : {}),
            ...(missionId ? { missionId } : {}),
          },
        },
      });

      setLinkUrl('');
      setLinkName('');
      setShowLinkModal(false);
      await refetch();
    } catch (err) {
      console.error('Add link failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttachment({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAttachmentClick = (att) => {
    if (att.type === 'LINK') {
      window.open(att.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(att.url, '_blank');
    }
  };

  const canEdit = state.isAdmin && !readOnly;

  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 mb-2 block">{t('common.attachments')}</label>

      <div className="space-y-2">
        {attachments.length > 0 ? (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors group/att"
            >
              <button
                onClick={() => handleAttachmentClick(att)}
                className="flex items-center gap-3 flex-1 min-w-0 text-right"
              >
                {att.type === 'FILE' ? (
                  <FileText className="w-5 h-5 text-primary-400 flex-shrink-0" />
                ) : (
                  <LinkIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                )}
                <span className="text-sm text-slate-700 flex-1 truncate">{att.name}</span>
                {att.type === 'LINK' ? (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                )}
              </button>
              {canEdit && (
                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/att:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">{t('common.no_attachments')}</p>
        )}

        {canEdit && (
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.uploading')}
                </>
              ) : (
                <>
                  <Paperclip className="w-4 h-4" />
                  {t('common.file')}
                </>
              )}
            </button>
            <button
              onClick={() => setShowLinkModal(true)}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              {t('common.link')}
            </button>
          </div>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-5 mx-4 animate-scale-in" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex-1 text-center">{t('common.add_link')}</h4>
              <button
                onClick={() => { setShowLinkModal(false); setLinkError(''); setLinkUrl(''); setLinkName(''); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={t('common.link_placeholder_example')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 transition-all placeholder:text-slate-400"
                  dir="ltr"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder={t('common.link_name')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 transition-all placeholder:text-slate-400"
                />
              </div>

              {linkError && (
                <p className="text-xs text-red-500 text-center">{linkError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddLink}
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {t('common.confirm')}
                </button>
                <button
                  onClick={() => { setShowLinkModal(false); setLinkError(''); setLinkUrl(''); setLinkName(''); }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
