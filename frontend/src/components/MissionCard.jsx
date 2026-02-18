import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';
import UserAvatar from './UserAvatar';

const statusColors = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  judging: '#eab308',
  needs_fix: '#ef4444',
  done: '#22c55e',
};

export default function MissionCard({ mission }) {
  const { dispatch, getUserById } = useApp();
  const assignee = getUserById(mission.assignee);
  const color = statusColors[mission.status] || '#94a3b8';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_MISSION_DRAWER', mission });
      }}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md group flex"
      style={{ backgroundColor: color + '12' }}
    >
      {/* Color stripe on the left */}
      <div
        className="w-2 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="p-3.5 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-primary-600 transition-colors">
            {mission.title}
          </h4>
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
