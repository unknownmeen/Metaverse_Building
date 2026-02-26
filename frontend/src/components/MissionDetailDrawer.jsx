import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import Drawer from './Drawer';
import AttachmentSection from './AttachmentSection';
import { useApp } from '../context/AppContext';
import { MissionStatusBadge, StepStatusBadge, PriorityBadge } from './StatusBadge';
import { GET_CHAT_MESSAGES } from '../graphql/queries';
import { SEND_MESSAGE, TAKE_MISSION, UPDATE_STEP_STATUS, UPDATE_MISSION, DELETE_MISSION, UPDATE_JUDGING_STEP } from '../graphql/mutations';
import { transformChatMessage, transformChatMessages } from '../graphql/adapters';
import { uploadFile } from '../services/uploadService';
import { t } from '../services/i18n';
import { LIMITS, isFutureOrToday } from '../lib/validation';
import { toastService } from '../services/toastService';
import PersianDatePicker from './PersianDatePicker';
import PrioritySelect from './PrioritySelect';
import UserAvatar from './UserAvatar';

function isStepLocked(steps, index) {
  return !steps.slice(0, index).every((step) => step.status === 'approved');
}

function missionSyncSignature(mission) {
  if (!mission) return '';
  return JSON.stringify({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    status: mission.status,
    priority: mission.priority,
    dueDateIso: mission.dueDateIso,
    assignee: mission.assignee,
    judgingSteps: (mission.judgingSteps || []).map((step) => ({
      id: step.id,
      status: step.status,
      order: step.order,
      judgeId: step.judgeId,
      title: step.title,
    })),
  });
}

const CHAT_POLLING = Object.freeze({
  activeMs: 2500,
  idleMs: 6000,
  hiddenMs: 15000,
  idleAfterMs: 30000,
  maxBackoffMs: 30000,
});

function getChatPollInterval({ isHidden, isIdle, errorStreak }) {
  const baseMs = isHidden
    ? CHAT_POLLING.hiddenMs
    : isIdle
      ? CHAT_POLLING.idleMs
      : CHAT_POLLING.activeMs;
  if (!errorStreak) return baseMs;
  return Math.min(baseMs * (errorStreak + 1), CHAT_POLLING.maxBackoffMs);
}

function ChatSection({ mission, step }) {
  const { state } = useApp();
  const [message, setMessage] = useState('');
  const [uploadingChat, setUploadingChat] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const chatFileRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollTimeoutRef = useRef(null);
  const inFlightRef = useRef(false);
  const errorStreakRef = useRef(0);
  const lastInteractionAtRef = useRef(Date.now());

  const { data, loading: loadingMessages, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { missionId: mission.id, stepId: step.id },
    skip: !mission.id || !step?.id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  const serverMessages = useMemo(
    () => transformChatMessages(data?.chatMessages || []),
    [data?.chatMessages]
  );
  const messages = useMemo(() => {
    const merged = [...serverMessages];
    const existingIds = new Set(serverMessages.map((m) => m.id));
    for (const localMessage of localMessages) {
      if (!existingIds.has(localMessage.id)) {
        merged.push(localMessage);
      }
    }
    return merged;
  }, [serverMessages, localMessages]);
  const showInitialLoading = loadingMessages && serverMessages.length === 0 && localMessages.length === 0;

  const syncMessages = useCallback(async () => {
    if (!mission?.id || !step?.id || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await refetch();
      errorStreakRef.current = 0;
    } catch {
      errorStreakRef.current += 1;
    } finally {
      inFlightRef.current = false;
    }
  }, [mission?.id, step?.id, refetch]);

  useEffect(() => {
    if (!mission?.id || !step?.id) return undefined;

    let disposed = false;

    const clearPollTimer = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const schedulePoll = () => {
      clearPollTimer();
      const inactiveFor = Date.now() - lastInteractionAtRef.current;
      const pollMs = getChatPollInterval({
        isHidden: document.hidden,
        isIdle: inactiveFor >= CHAT_POLLING.idleAfterMs,
        errorStreak: errorStreakRef.current,
      });
      pollTimeoutRef.current = setTimeout(async () => {
        if (disposed) return;
        await syncMessages();
        schedulePoll();
      }, pollMs);
    };

    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };

    const onVisibilityChange = async () => {
      if (!document.hidden) {
        markInteraction();
        await syncMessages();
      }
      schedulePoll();
    };

    const onFocus = async () => {
      markInteraction();
      await syncMessages();
      schedulePoll();
    };

    const onUserInteraction = () => {
      markInteraction();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pointerdown', onUserInteraction);
    window.addEventListener('keydown', onUserInteraction);

    schedulePoll();

    return () => {
      disposed = true;
      clearPollTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pointerdown', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };
  }, [mission?.id, step?.id, syncMessages]);

  useEffect(() => {
    if (!serverMessages.length || !localMessages.length) return;
    const serverIds = new Set(serverMessages.map((msg) => msg.id));
    setLocalMessages((prev) => {
      const filtered = prev.filter((msg) => !serverIds.has(msg.id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [serverMessages, localMessages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    try {
      const { data: mutationData } = await sendMessage({
        variables: {
          input: {
            missionId: mission.id,
            stepId: step.id,
            text: message,
          },
        },
      });
      if (mutationData?.sendMessage) {
        const created = transformChatMessage(mutationData.sendMessage);
        if (created) {
          setLocalMessages((prev) => [...prev.filter((m) => m.id !== created.id), created]);
        }
      }
      setMessage('');
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
      const { data: mutationData } = await sendMessage({
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
      if (mutationData?.sendMessage) {
        const created = transformChatMessage(mutationData.sendMessage);
        if (created) {
          setLocalMessages((prev) => [...prev.filter((m) => m.id !== created.id), created]);
        }
      }
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.chat.send_failed');
      toastService.error(msg);
    } finally {
      setUploadingChat(false);
      if (chatFileRef.current) chatFileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col min-h-0">
      <div className="px-4 py-3 bg-gradient-to-l from-primary-50 to-slate-50 border-b border-slate-100 flex-shrink-0">
        <h4 className="text-sm font-bold text-slate-700">{t('chat.title')}</h4>
      </div>

      <div ref={messagesContainerRef} className="min-h-[180px] sm:min-h-[224px] max-h-[40vh] sm:max-h-[280px] overflow-y-auto p-3 space-y-3 flex-1">
        {showInitialLoading ? (
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
                <UserAvatar src={sender?.avatar} className="w-7 h-7 flex-shrink-0 mt-1" />
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed text-right break-words overflow-hidden min-w-0 max-w-full ${
                      isMe
                        ? 'bg-primary-500 text-white rounded-tl-sm'
                        : 'bg-slate-50 text-slate-700 rounded-tr-sm border border-slate-100'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold mb-1 ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                      {sender?.name}
                    </p>
                    <span className="break-words whitespace-pre-wrap">{msg.text}</span>
                    {msg.file && (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={msg.file.name}
                        className={`mt-2 flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity min-w-0 ${
                          isMe ? 'text-primary-100' : 'text-primary-500'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="underline truncate">{msg.file.name}</span>
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

      <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 w-full">
          <input ref={chatFileRef} type="file" className="hidden" onChange={handleChatFileUpload} />
          <button
            onClick={() => chatFileRef.current?.click()}
            disabled={uploadingChat || sending}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50 touch-manipulation"
            aria-label={t('chat.attach')}
          >
            {uploadingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, LIMITS.CHAT_MESSAGE_MAX))}
            placeholder={t('chat.placeholder')}
            maxLength={LIMITS.CHAT_MESSAGE_MAX}
            className="flex-1 min-w-0 px-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all placeholder:text-slate-300"
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            disabled={sending || uploadingChat}
          />
          <button
            onClick={handleSend}
            disabled={sending || uploadingChat || !message.trim()}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] w-11 h-11 sm:w-auto sm:h-auto sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 touch-manipulation"
            aria-label={t('chat.send')}
          >
            {sending ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-5 h-5 sm:w-4 sm:h-4" />}
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
  const { state, dispatch, getUserById, getMissionById, refreshProducts, refreshNotifications } = useApp();
  const mission = state.selectedMission;
  const [activeStepId, setActiveStepId] = useState(null);
  const [takeMission, { loading: taking }] = useMutation(TAKE_MISSION);
  const [updateMission, { loading: updating }] = useMutation(UPDATE_MISSION);
  const [updateJudgingStep] = useMutation(UPDATE_JUDGING_STEP);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('normal');
  const [editAssignee, setEditAssignee] = useState('');
  const [editSteps, setEditSteps] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMission, { loading: deleting }] = useMutation(DELETE_MISSION);

  useEffect(() => {
    if (!state.showMissionDrawer || !mission?.id) return;
    const latestMission = getMissionById(mission.id);
    if (
      latestMission &&
      !editMode &&
      missionSyncSignature(latestMission) !== missionSyncSignature(mission)
    ) {
      dispatch({ type: 'OPEN_MISSION_DRAWER', mission: latestMission });
    }
  }, [state.products, state.showMissionDrawer, mission, getMissionById, dispatch, editMode]);

  useEffect(() => {
    if (state.showMissionDrawer && mission && state.missionDrawerStepId) {
      const stepExists = (mission.judgingSteps || []).some((s) => s.id === state.missionDrawerStepId);
      if (stepExists) setActiveStepId(state.missionDrawerStepId);
    }
  }, [state.showMissionDrawer, mission?.id, state.missionDrawerStepId]);

  useEffect(() => {
    if (!state.showMissionDrawer) setEditMode(false);
  }, [state.showMissionDrawer]);

  useEffect(() => {
    if (showDeleteConfirm) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [showDeleteConfirm]);

  if (!mission) return null;

  const assignee = getUserById(mission.assignee);
  const steps = [...(mission.judgingSteps || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const assignableUsers = state.users.filter((u) => u.role !== 'observer');
  const judgeOptions = state.users.filter((u) => (u.role === 'judge' || u.role === 'admin') && u.role !== 'observer');

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
    await Promise.allSettled([refreshProducts(), refreshNotifications()]);
  };

  const handleStartEdit = () => {
    setEditTitle(mission.title || '');
    setEditDescription(mission.description || '');
    setEditDueDate(mission.dueDateIso || '');
    setEditPriority(mission.priority || 'normal');
    setEditAssignee(mission.assignee != null && mission.assignee !== '' ? String(mission.assignee) : '');
    setEditSteps(
      (mission.judgingSteps || []).map((step) => ({
        id: step.id,
        title: step.title || '',
        judgeId: step.judgeId != null ? String(step.judgeId) : '',
      }))
    );
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleEditStepChange = (id, field, value) => {
    setEditSteps((prev) => prev.map((step) => (step.id === id ? { ...step, [field]: value } : step)));
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
      if (state.isAdmin && editAssignee && editAssignee !== '') {
        input.assigneeId = Number(editAssignee);
      }
      await updateMission({
        variables: { id: mission.id, input },
      });

      if (state.isAdmin && editSteps.length > 0) {
        const currentById = new Map((mission.judgingSteps || []).map((step) => [step.id, step]));
        const changedSteps = editSteps.filter((step) => {
          const current = currentById.get(step.id);
          if (!current) return false;
          const nextTitle = step.title.trim();
          const nextJudgeId = Number(step.judgeId);
          if (!nextTitle || !nextJudgeId) return false;
          return current.title !== nextTitle || Number(current.judgeId) !== nextJudgeId;
        });

        for (const step of changedSteps) {
          await updateJudgingStep({
            variables: {
              id: step.id,
              input: {
                title: step.title.trim(),
                judgeId: Number(step.judgeId),
              },
            },
          });
        }
      }

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

  const handleDeleteMission = async () => {
    if (deleting) return;
    try {
      await deleteMission({ variables: { id: mission.id } });
      setShowDeleteConfirm(false);
      await Promise.all([refreshProducts(), refreshNotifications()]);
      dispatch({ type: 'CLOSE_MISSION_DRAWER' });
      toastService.success(t('success.mission_deleted'));
    } catch (error) {
      const msg = error?.graphQLErrors?.[0]?.message || error?.message || t('errors.mission.delete_failed');
      toastService.error(msg);
    }
  };

  return (
    <Drawer
      open={state.showMissionDrawer}
      onClose={() => dispatch({ type: 'CLOSE_MISSION_DRAWER' })}
      title={t('mission.details')}
      width="max-w-lg"
      headerActions={
        state.isAdmin && editMode ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={updating || deleting}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
            title={t('errors.mission.delete_action')}
          >
            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        ) : null
      }
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
          {editMode && state.isAdmin ? (
            <select
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              disabled={updating}
            >
              <option value="">{t('common.select')}</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          ) : assignee ? (
            <div className="flex items-center gap-3">
              <UserAvatar src={assignee.avatar} className="w-8 h-8" />
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

        {steps.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">{t('judging.steps')}</label>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const judge = getUserById(step.judgeId) || step.judge;
                const editStep = editSteps.find((s) => s.id === step.id);
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
                      onClick={() => !editMode && !locked && setActiveStepId(active ? STEP_CLOSED : step.id)}
                      className="w-full p-3 text-right"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          {editMode && state.isAdmin ? (
                            <input
                              type="text"
                              value={editStep?.title ?? step.title}
                              onChange={(event) => handleEditStepChange(step.id, 'title', event.target.value)}
                              maxLength={LIMITS.STEP_TITLE_MAX}
                              className="min-w-0 flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{step.title}</span>
                          )}
                          {locked && <span className="text-[10px] text-slate-400">({t('judging.locked')})</span>}
                        </div>
                        <StepStatusBadge status={step.status} />
                      </div>
                      {editMode && state.isAdmin ? (
                        <div className="mr-8">
                          <select
                            value={editStep?.judgeId ?? (step.judgeId != null ? String(step.judgeId) : '')}
                            onChange={(event) => handleEditStepChange(step.id, 'judgeId', event.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                          >
                            <option value="">{t('judging.judge')}</option>
                            {judgeOptions.map((judgeOption) => (
                              <option key={judgeOption.id} value={judgeOption.id}>
                                {judgeOption.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : judge ? (
                        <div className="flex items-center gap-2 mr-8">
                          <UserAvatar src={judge.avatar} className="w-5 h-5 flex-shrink-0" />
                          <span className="text-xs text-slate-500">{t('judging.judge_label', { name: judge.name })}</span>
                        </div>
                      ) : null}
                    </button>

                    {!editMode && !locked && active && (
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

        {mission.status === 'pending' && !editMode && state.user?.role !== 'observer' && (
          <button
            onClick={handleTakeMission}
            disabled={taking}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {taking ? <Loader2 className="w-5 h-5 animate-spin" /> : <HandMetal className="w-5 h-5" />}
            {taking ? t('common.submitting') : t('mission.take')}
          </button>
        )}

        {editMode && (
          <div className="flex gap-3 pt-2">
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
      </div>

      {showDeleteConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
            dir="rtl"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!deleting && e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="p-6">
                <h4 className="text-lg font-bold text-slate-800 text-center mb-3">
                  {t('errors.mission.delete_confirm_title')}
                </h4>
                <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
                  {t('errors.mission.delete_confirm')}
                </p>
                <div className="flex gap-3 flex-row-reverse">
                  <button
                    onClick={handleDeleteMission}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {deleting ? t('common.submitting') : t('errors.mission.delete_action')}
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
