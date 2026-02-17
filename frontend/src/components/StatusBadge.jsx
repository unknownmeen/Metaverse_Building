import { MISSION_STATUS, STEP_STATUS, PRIORITY } from '../data/mockData';
import { t } from '../services/i18n';

const statusMap = {
  pending: MISSION_STATUS.PENDING,
  in_progress: MISSION_STATUS.IN_PROGRESS,
  judging: MISSION_STATUS.JUDGING,
  needs_fix: MISSION_STATUS.NEEDS_FIX,
  done: MISSION_STATUS.DONE,
};

const stepStatusMap = {
  not_done: STEP_STATUS.NOT_DONE,
  waiting_judge: STEP_STATUS.WAITING_JUDGE,
  needs_fix: STEP_STATUS.NEEDS_FIX,
  approved: STEP_STATUS.APPROVED,
};

const priorityMap = {
  urgent: PRIORITY.URGENT,
  important: PRIORITY.IMPORTANT,
  normal: PRIORITY.NORMAL,
};

export function MissionStatusBadge({ status }) {
  const s = statusMap[status];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {t(`status.mission.${s.key}`)}
    </span>
  );
}

export function StepStatusBadge({ status }) {
  const s = stepStatusMap[status];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {t(`status.step.${s.key}`)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = priorityMap[priority];
  if (!p) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: p.bg, color: p.color }}
    >
      {t(`status.priority.${p.key}`)}
    </span>
  );
}

export function StatusDot({ status }) {
  const s = statusMap[status];
  if (!s) return null;
  return (
    <span
      className="w-3 h-3 rounded-full inline-block ring-2 ring-white"
      style={{ backgroundColor: s.color }}
      title={t(`status.mission.${s.key}`)}
    />
  );
}
