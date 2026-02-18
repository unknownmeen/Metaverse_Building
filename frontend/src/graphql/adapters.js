/**
 * Adapter layer for transforming GraphQL API responses
 * to match the frontend data models used by components.
 *
 * This follows the Adapter Pattern to decouple the API
 * contract from the internal view-model structure.
 */

import { t } from '../services/i18n';

function resolveAvatarUrl(user) {
  if (!user) return null;
  if (user.avatar) return user.avatar;
  const aid = user.avatarId;
  if (!aid) return null;
  if (aid.startsWith('http://') || aid.startsWith('https://') || aid.startsWith('/')) return aid;
  return null;
}

/* ───────────── Enum Normalization ───────────── */

/**
 * API returns enums in UPPER_CASE (e.g. IN_PROGRESS).
 * Frontend components expect lower_case (e.g. in_progress).
 */
export function normalizeEnum(value) {
  return value?.toLowerCase() ?? '';
}

/* ───────────── Date Formatting ───────────── */

/**
 * Format an ISO date string to Persian locale date.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('fa-IR');
  } catch {
    return isoString;
  }
}

/**
 * Format an ISO date string to a relative time description in Persian.
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('time.just_now');
    if (diffMin < 60) return t('time.minutes_ago', { count: diffMin });
    if (diffHour < 24) return t('time.hours_ago', { count: diffHour });
    if (diffDay < 7) return t('time.days_ago', { count: diffDay });
    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

/* ───────────── User ───────────── */

export function transformUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: normalizeEnum(user.role),
    avatar: resolveAvatarUrl(user),
  };
}

export function transformUsers(users) {
  return (users || []).map(transformUser);
}

/* ───────────── Mission ───────────── */

/**
 * Transform a MissionEntity from the API into the frontend model.
 * Keeps `assignee` as a user ID for backward compatibility with
 * `getUserById()` calls throughout the UI.
 */
export function transformMission(mission) {
  if (!mission) return null;
  const assigneeUser = transformUser(mission.assignee);
  const steps = (mission.judgingSteps || []).map((step) => ({
    id: step.id,
    title: step.title,
    status: normalizeEnum(step.status),
    order: step.order,
    judgeId: step.judge?.id ?? null,
    judge: transformUser(step.judge),
  }));
  return {
    type: 'mission',
    id: mission.id,
    title: mission.title,
    description: mission.description || '',
    status: normalizeEnum(mission.status),
    priority: normalizeEnum(mission.priority),
    assignee: assigneeUser?.id ?? null,
    assigneeUser,
    createdAt: formatDate(mission.createdAt),
    dueDate: formatDate(mission.dueDate),
    dueDateIso: mission.dueDate || null,
    judgingSteps: steps,
    attachments: [],
    chat: [],
  };
}

/* ───────────── Product Tree ───────────── */

/**
 * Recursively transform a ProductEntity tree from the API.
 * Merges `children` (sub-products) and `missions` into a single
 * `children` array with a `type` field, matching the mock-data
 * structure that existing components rely on.
 */
export function transformProductTree(product) {
  if (!product) return null;

  const children = [];

  if (product.children) {
    children.push(
      ...product.children.map((child) => transformProductTree(child))
    );
  }

  if (product.missions) {
    children.push(
      ...product.missions.map((mission) => transformMission(mission))
    );
  }

  return {
    type: 'product',
    id: product.id,
    title: product.title,
    description: product.description || '',
    parentId: product.parentId || null,
    attachments: [],
    children,
  };
}

/* ───────────── Notification ───────────── */

export function transformNotification(notification) {
  if (!notification) return null;
  return {
    id: notification.id,
    type: normalizeEnum(notification.type),
    text: notification.text,
    time: formatRelativeTime(notification.createdAt),
    read: notification.read,
    missionId: notification.missionId ?? null,
    stepId: notification.stepId ?? null,
    sender: notification.sender ? transformUser(notification.sender) : null,
  };
}

export function transformNotifications(notifications) {
  return (notifications || []).map(transformNotification);
}

/* ───────────── Chat Message ───────────── */

export function transformChatMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    stepId: message.stepId ?? null,
    sender: message.sender ? transformUser(message.sender) : null,
    text: message.text,
    time: formatRelativeTime(message.createdAt),
    file: message.fileUrl
      ? { name: message.fileName || t('common.file'), url: message.fileUrl }
      : null,
  };
}

export function transformChatMessages(messages) {
  return (messages || []).map(transformChatMessage);
}
