import { useState, useRef } from 'react';
import { Plus, Trash2, Paperclip, LinkIcon, Loader2, FileText, X } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import Drawer from './Drawer';
import PersianDatePicker from './PersianDatePicker';
import PrioritySelect from './PrioritySelect';
import { useApp } from '../context/AppContext';
import { PRIORITY } from '../data/mockData';
import { CREATE_MISSION, CREATE_JUDGING_STEP, CREATE_ATTACHMENT } from '../graphql/mutations';
import { uploadFile, isValidUrl } from '../services/uploadService';
import { t } from '../services/i18n';
import { LIMITS, charsRemaining, isFutureOrToday } from '../lib/validation';

function getTodayIsoLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CreateMissionDrawer() {
  const { state, dispatch, refreshProducts } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('normal');
  const [steps, setSteps] = useState([{ id: Date.now(), title: '', judgeId: '', status: 'not_done' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkError, setLinkError] = useState('');
  const fileInputRef = useRef(null);

  const [createMission] = useMutation(CREATE_MISSION);
  const [createJudgingStep] = useMutation(CREATE_JUDGING_STEP);
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

  const removePendingAttachment = (index) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), title: '', judgeId: '', status: 'not_done' }]);
  };

  const removeStep = (id) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id, field, value) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setAssignee('');
    setPriority('normal');
    setSteps([{ id: Date.now(), title: '', judgeId: '', status: 'not_done' }]);
    setError('');
    setPendingAttachments([]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;

    if (dueDate && !isFutureOrToday(dueDate)) {
      setError(t('errors.validation.due_date_past'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const input = {
        title,
        description: description || '',
        dueDate: dueDate || getTodayIsoLocal(),
        productId: state.drawerParentProductId,
        priority: priority.toUpperCase(),
      };
      if (assignee && assignee !== '') {
        input.assigneeId = Number(assignee);
      }

      const { data } = await createMission({
        variables: { input },
      });

      if (data?.createMission?.id) {
        const validSteps = steps.filter(s => s.title.trim() && s.judgeId);
        for (const step of validSteps) {
          await createJudgingStep({
            variables: {
              input: {
                missionId: data.createMission.id,
                title: step.title,
                judgeId: Number(step.judgeId),
              },
            },
          });
        }

        for (const att of pendingAttachments) {
          await createAttachment({
            variables: {
              input: {
                name: att.name,
                url: att.url,
                type: att.type,
                missionId: data.createMission.id,
              },
            },
          });
        }
      }

      resetForm();
      await refreshProducts();
      dispatch({ type: 'CLOSE_CREATE_MISSION' });
    } catch (err) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        t('errors.mission.create_failed');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const judges = state.users.filter(u => u.role === 'judge' || u.role === 'admin');

  return (
    <Drawer
      open={state.showCreateMissionDrawer}
      onClose={() => dispatch({ type: 'CLOSE_CREATE_MISSION' })}
      title={t('mission.create')}
      width="max-w-lg"
    >
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('mission.title_label')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.TITLE_MAX))}
            placeholder={t('mission.title_placeholder')}
            maxLength={LIMITS.TITLE_MAX}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-slate-300"
            disabled={submitting}
          />
          {title.length > LIMITS.TITLE_MAX * 0.8 && (
            <span className={`text-[10px] mt-1 block text-left ${charsRemaining(title, LIMITS.TITLE_MAX) < 0 ? 'text-red-500' : 'text-slate-400'}`} dir="ltr">
              {charsRemaining(title, LIMITS.TITLE_MAX)}
            </span>
          )}
        </div>

        {/* Due Date & Assignee Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('mission.due_date')}</label>
            <PersianDatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder={t('mission.due_date_placeholder')}
              minDate={getTodayIsoLocal()}
              className="w-full"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('mission.assignee_optional')}</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all appearance-none"
              disabled={submitting}
            >
              <option value="">{t('common.select')}</option>
              {state.users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <PrioritySelect value={priority} onChange={setPriority} disabled={submitting} />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('mission.description_label')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, LIMITS.DESCRIPTION_MAX))}
            placeholder={t('mission.description_placeholder')}
            maxLength={LIMITS.DESCRIPTION_MAX}
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all resize-none placeholder:text-slate-300 leading-relaxed"
            disabled={submitting}
          />
        </div>

        {/* Judging Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400">{t('judging.steps')}</label>
            <button
              onClick={addStep}
              disabled={submitting}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('judging.add_step')}
            </button>
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(step.id, 'title', e.target.value.slice(0, LIMITS.STEP_TITLE_MAX))}
                    placeholder={t('judging.step_title_placeholder')}
                    maxLength={LIMITS.STEP_TITLE_MAX}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all placeholder:text-slate-300"
                    disabled={submitting}
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(step.id)}
                      disabled={submitting}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={step.judgeId}
                  onChange={(e) => updateStep(step.id, 'judgeId', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all appearance-none"
                  disabled={submitting}
                >
                  <option value="">{t('judging.judge')}</option>
                  {judges.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">{t('common.attachments')}</label>
          <div className="space-y-2">
            {pendingAttachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                {att.type === 'FILE' ? (
                  <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                ) : (
                  <LinkIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                )}
                <span className="text-sm text-slate-700 flex-1 truncate">{att.name}</span>
                <button onClick={() => removePendingAttachment(idx)} className="p-1 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                {uploading ? t('common.uploading') : t('common.file')}
              </button>
              <button
                onClick={() => setShowLinkModal(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-colors disabled:opacity-50"
              >
                <LinkIcon className="w-4 h-4" />
                {t('common.link')}
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
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-amber-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('common.creating')}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              {t('mission.create')}
            </>
          )}
        </button>
      </div>
    </Drawer>
  );
}
