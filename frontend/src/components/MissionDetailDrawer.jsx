import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Send,
  Paperclip,
  FileText,
  CheckCircle,
  XCircle,
  HandMetal,
  AlertTriangle,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import Drawer from './Drawer';
import AttachmentSection from './AttachmentSection';
import { useApp } from '../context/AppContext';
import { MissionStatusBadge, StepStatusBadge, PriorityBadge } from './StatusBadge';
import { GET_CHAT_MESSAGES } from '../graphql/queries';
import { SEND_MESSAGE, TAKE_MISSION, UPDATE_STEP_STATUS, UPDATE_MISSION } from '../graphql/mutations';
import { transformChatMessages } from '../graphql/adapters';
import { uploadFile } from '../services/uploadService';
import { t } from '../services/i18n';
import { LIMITS, isFutureOrToday } from '../lib/validation';
import { toastService } from '../services/toastService';
import PersianDatePicker from './PersianDatePicker';
import PrioritySelect from './PrioritySelect';

function isStepLocked(steps, index) {
  return !steps.slice(0, index).every((step) => step.status === 'approved');
}

function ChatSection({ mission, step }) {
  const { state } = useApp();
  const [message, setMessage] = useState('');
  const [uploadingChat, setUploadingChat] = useState(false);
  const chatFileRef = useRef(null);

  const { data, loading: loadingMessages, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { missionId: mission.id, stepId: step.id },
    skip: !mission.id || !step?.id,
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  const messages = data?.chatMessages ? transformChatMessages(data.chatMessages) : [];

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    try {
      await sendMessage({
        variables: {
          input: {
            missionId: mission.id,
            stepId: step.id,
            text: message,
          },
        },
      });
      setMessage('');
      refetch();
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.chat.send_failed');
      toastService.error(msg);
    }
  };

  const handleChatFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingChat(true);
      const result = await uploadFile(file);
      await sendMessage({
        variables: {
          input: {
            missionId: mission.id,
            stepId: step.id,
            text: file.name,
            fileName: file.name,
            fileUrl: result.url,
          },
        },
      });
      refetch();
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.chat.send_failed');
      toastService.error(msg);
    } finally {
      setUploadingChat(false);
      if (chatFileRef.current) chatFileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
      <div className="px-4 py-3 bg-gradient-to-l from-primary-50 to-slate-50 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-700">{t('chat.title')}</h4>
      </div>

      <div className="h-56 overflow-y-auto p-3 space-y-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            {t('chat.empty')}
          </div>
        ) : (
          messages.map((msg) => {
            const sender = msg.sender;
            const isMe = sender?.id === state.user?.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img
                  src={sender?.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0 mt-1"
                />
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed text-right ${
                      isMe
                        ? 'bg-primary-500 text-white rounded-tl-sm'
                        : 'bg-slate-50 text-slate-700 rounded-tr-sm border border-slate-100'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold mb-1 ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                      {sender?.name}
                    </p>
                    {msg.text}
                    {msg.file && (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={msg.file.name}
                        className={`mt-2 flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity ${
                          isMe ? 'text-primary-100' : 'text-primary-500'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="underline">{msg.file.name}</span>
                      </a>
                    )}
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'text-left' : 'text-right'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <input ref={chatFileRef} type="file" className="hidden" onChange={handleChatFileUpload} />
          <button
            onClick={() => chatFileRef.current?.click()}
            disabled={uploadingChat || sending}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {uploadingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, LIMITS.CHAT_MESSAGE_MAX))}
            placeholder={t('chat.placeholder')}
            maxLength={LIMITS.CHAT_MESSAGE_MAX}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all placeholder:text-slate-300"
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            disabled={sending || uploadingChat}
          />
          <button
            onClick={handleSend}
            disabled={sending || uploadingChat}
            className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepActions({ mission, step, onStatusChanged }) {
  const { state } = useApp();
  const [updateStepStatus, { loading }] = useMutation(UPDATE_STEP_STATUS);
  const isAssignee = mission.assignee === state.user?.id;
  const isJudgeOfStep = step.judgeId === state.user?.id || step.judge?.id === state.user?.id;
  const canSendForJudging = isAssignee && (step.status === 'not_done' || step.status === 'needs_fix');
  const canJudge = isJudgeOfStep && step.status === 'waiting_judge';

  const handleStepStatus = async (newStatus) => {
    if (loading) return;
    const normalized = String(step.status || '').toLowerCase();
    const target = newStatus.toUpperCase();
    if (target === 'WAITING_JUDGE' && (normalized === 'waiting_judge' || normalized === 'approved')) return;
    if ((target === 'APPROVED' || target === 'NEEDS_FIX') && normalized !== 'waiting_judge') return;
    try {
      await updateStepStatus({
        variables: { id: step.id, status: target },
      });
      onStatusChanged?.();
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.judging.update_step_failed');
      toastService.error(msg);
    }
  };

  if (!canSendForJudging && !canJudge) return null;

  return (
    <div className="flex gap-2">
      {canSendForJudging && (
        <button
          onClick={() => handleStepStatus('WAITING_JUDGE')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {t('mission.send_for_judging')}
        </button>
      )}
      {canJudge && (
        <>
          <button
            onClick={() => handleStepStatus('APPROVED')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t('mission.approve_judging')}
          </button>
          <button
            onClick={() => handleStepStatus('NEEDS_FIX')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            {t('mission.needs_fix_action')}
          </button>
        </>
      )}
    </div>
  );
}

export default function MissionDetailDrawer() {
  const { state, dispatch, getUserById, getMissionById, refreshProducts } = useApp();
  const mission = state.selectedMission;
  const [activeStepId, setActiveStepId] = useState(null);
  const [takeMission, { loading: taking }] = useMutation(TAKE_MISSION);
  const [updateMission, { loading: updating }] = useMutation(UPDATE_MISSION);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('normal');

  useEffect(() => {
    if (!state.showMissionDrawer || !mission?.id) return;
    const latestMission = getMissionById(mission.id);
    if (latestMission && latestMission !== mission) {
      dispatch({ type: 'OPEN_MISSION_DRAWER', mission: latestMission });
    }
  }, [state.products, state.showMissionDrawer, mission, getMissionById, dispatch]);

  useEffect(() => {
    if (state.showMissionDrawer && mission && state.missionDrawerStepId) {
      const stepExists = (mission.judgingSteps || []).some((s) => s.id === state.missionDrawerStepId);
      if (stepExists) setActiveStepId(state.missionDrawerStepId);
    }
  }, [state.showMissionDrawer, mission?.id, state.missionDrawerStepId]);

  useEffect(() => {
    if (!state.showMissionDrawer) setEditMode(false);
  }, [state.showMissionDrawer]);

  if (!mission) return null;

  const assignee = getUserById(mission.assignee);
  const steps = [...(mission.judgingSteps || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const STEP_CLOSED = '__closed__';
  const resolvedActiveStepId = (() => {
    if (!steps.length) return null;
    if (activeStepId === STEP_CLOSED) return null;
    if (activeStepId) {
      const activeIndex = steps.findIndex((step) => step.id === activeStepId);
      if (activeIndex !== -1 && !isStepLocked(steps, activeIndex)) {
        return activeStepId;
      }
    }
    return steps.find((_, index) => !isStepLocked(steps, index))?.id || steps[0].id;
  })();

  const handleTakeMission = async () => {
    if (taking) return;
    try {
      await takeMission({ variables: { id: mission.id } });
      await refreshProducts();
      dispatch({ type: 'CLOSE_MISSION_DRAWER' });
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.mission.take_failed');
      toastService.error(msg);
    }
  };

  const handleStatusChanged = async () => {
    await refreshProducts();
  };

  const handleStartEdit = () => {
    setEditTitle(mission.title || '');
    setEditDescription(mission.description || '');
    setEditDueDate(mission.dueDateIso || '');
    setEditPriority(mission.priority || 'normal');
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || updating) return;
    try {
      const input = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority.toUpperCase(),
      };
      if (editDueDate && isFutureOrToday(editDueDate)) {
        input.dueDate = editDueDate;
      }
      await updateMission({
        variables: { id: mission.id, input },
      });
      await refreshProducts();
      const latest = getMissionById(mission.id);
      if (latest) dispatch({ type: 'OPEN_MISSION_DRAWER', mission: latest });
      setEditMode(false);
      toastService.success(t('common.saved'));
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.mission.update_failed');
      toastService.error(msg);
    }
  };

  return (
    <Drawer
      open={state.showMissionDrawer}
      onClose={() => dispatch({ type: 'CLOSE_MISSION_DRAWER' })}
      title={t('mission.details')}
      width="max-w-lg"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editMode ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full font-bold text-base text-slate-800 mb-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                placeholder={t('mission.title')}
              />
            ) : (
              <h3 className="font-bold text-lg text-slate-800 mb-2">{mission.title}</h3>
            )}
            <MissionStatusBadge status={mission.status} />
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <PriorityBadge priority={mission.priority} />
            ) : (
              <div className="min-w-[120px]">
                <PrioritySelect value={editPriority} onChange={setEditPriority} disabled={updating} showLabel={false} className="mb-0" />
              </div>
            )}
            {state.isAdmin && !editMode && (
              <button
                onClick={handleStartEdit}
                className="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                title={t('common.edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3" />
              {t('mission.created_at')}
            </div>
            <p className="text-xs font-semibold text-slate-700">{mission.createdAt}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
              <Calendar className="w-3 h-3" />
              {t('mission.due_date')}
            </div>
            {editMode ? (
              <PersianDatePicker
                value={editDueDate}
                onChange={setEditDueDate}
                minDate={new Date().toISOString().slice(0, 10)}
                className="w-full text-sm"
              />
            ) : (
              <p className="text-xs font-semibold text-slate-700">{mission.dueDate}</p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <User className="w-3 h-3" />
            {t('mission.assignee')}
          </div>
          {assignee ? (
            <div className="flex items-center gap-3">
              <img src={assignee.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
              <span className="text-sm font-semibold text-slate-700">{assignee.name}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t('common.not_set')}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{t('common.description')}</label>
            {editMode ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none resize-none"
              placeholder={t('common.description')}
            />
          ) : (
            <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg leading-relaxed">
              {mission.description || t('common.no_description')}
            </p>
          )}
        </div>

        {editMode && (
          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={updating || !editTitle.trim()}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {updating ? t('common.saving') : t('common.save_changes')}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={updating}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-70"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">{t('judging.steps')}</label>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const judge = getUserById(step.judgeId) || step.judge;
                const locked = isStepLocked(steps, index);
                const active = step.id === resolvedActiveStepId;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border transition-colors ${
                      locked
                        ? 'bg-slate-50/60 border-slate-100 opacity-75'
                        : active
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => !locked && setActiveStepId(active ? STEP_CLOSED : step.id)}
                      className="w-full p-3 text-right"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{step.title}</span>
                          {locked && <span className="text-[10px] text-slate-400">({t('judging.locked')})</span>}
                        </div>
                        <StepStatusBadge status={step.status} />
                      </div>
                      {judge && (
                        <div className="flex items-center gap-2 mr-8">
                          <img src={judge.avatar} alt="" className="w-5 h-5 rounded-full bg-slate-200" />
                          <span className="text-xs text-slate-500">{judge.name}</span>
                        </div>
                      )}
                    </button>

                    {!locked && active && (
                      <div className="border-t border-slate-200 px-3 pb-3 pt-3 space-y-3">
                        <ChatSection mission={mission} step={step} />
                        <StepActions mission={mission} step={step} onStatusChanged={handleStatusChanged} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AttachmentSection missionId={mission.id} />

        {mission.status === 'pending' && (
          <button
            onClick={handleTakeMission}
            disabled={taking}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {taking ? <Loader2 className="w-5 h-5 animate-spin" /> : <HandMetal className="w-5 h-5" />}
            {taking ? t('common.submitting') : t('mission.take')}
          </button>
        )}
      </div>
    </Drawer>
  );
}
