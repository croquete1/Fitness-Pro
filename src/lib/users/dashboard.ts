import type {
  AdminUserRecord,
  AdminUsersDashboardData,
  AdminUsersDistribution,
  AdminUsersHighlight,
  AdminUsersRow,
  AdminUsersTimelinePoint,
  AdminUserRoleKey,
  AdminUserStatusKey,
} from './types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const ROLE_LABEL: Record<AdminUserRoleKey, string> = {
  admin: 'Administradores',
  trainer: 'Treinadores',
  client: 'Clientes',
  unknown: 'Indefinido',
};

const STATUS_LABEL: Record<AdminUserStatusKey, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  suspended: 'Suspenso',
  disabled: 'Desativado',
  invited: 'Convite enviado',
  unknown: 'Indefinido',
};

const STATUS_TONE: Record<AdminUserStatusKey, 'positive' | 'warning' | 'critical' | 'neutral'> = {
  active: 'positive',
  pending: 'warning',
  invited: 'warning',
  suspended: 'critical',
  disabled: 'critical',
  unknown: 'neutral',
};

function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIsoOrNull(value: string | number | Date | null | undefined): string | null {
  const date = parseDate(value);
  return date ? date.toISOString() : null;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatWeekLabel(date: Date) {
  const end = new Date(date.getTime() + 6 * DAY_MS);
  const startLabel = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  const endLabel = end.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  return `${startLabel} – ${endLabel}`;
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${(value * 100).toFixed(0)}%`;
}

function normaliseRole(role: string | null | undefined): AdminUserRoleKey {
  if (!role) return 'unknown';
  const value = role.toString().trim().toUpperCase();
  if (value.includes('TRAIN')) return 'trainer';
  if (value.includes('CLIENT') || value.includes('ALUNO')) return 'client';
  if (value.includes('ADMIN')) return 'admin';
  return 'unknown';
}

function normaliseStatus(
  status: string | null | undefined,
  approved: boolean | null | undefined,
  active: boolean | null | undefined,
): AdminUserStatusKey {
  const value = status?.toString().trim().toUpperCase();
  if (value === 'ACTIVE' || value === 'CONFIRMED') return 'active';
  if (value === 'PENDING' || value === 'WAITING' || value === 'REVIEW') return 'pending';
  if (value === 'INVITED' || value === 'INVITE' || value === 'ONBOARDING') return 'invited';
  if (value === 'SUSPENDED' || value === 'BLOCKED') return 'suspended';
  if (value === 'DISABLED' || value === 'DEACTIVATED' || active === false) return 'disabled';
  if (approved === false) return 'pending';
  return 'unknown';
}

function formatTrend(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
    if (current > 0 && previous === 0) return '+∞% vs período anterior';
    return null;
  }
  const delta = (current - previous) / previous;
  if (!Number.isFinite(delta)) return null;
  const percent = (delta * 100).toFixed(0);
  const prefix = delta >= 0 ? '+' : '';
  return `${prefix}${percent}% vs período anterior`;
}

function buildHighlight(row: AdminUsersRow): AdminUsersHighlight {
  return {
    id: row.id,
    name: row.displayName,
    email: row.email,
    roleLabel: row.roleLabel,
    statusLabel: row.statusLabel,
    statusTone: row.statusTone,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
  };
}

export function buildAdminUsersDashboard(
  records: AdminUserRecord[],
  opts: { supabase?: boolean; now?: Date | string | number; weeks?: number } = {},
): AdminUsersDashboardData {
  const now = parseDate(opts.now) ?? new Date();
  const weeks = Math.max(6, Math.min(opts.weeks ?? 12, 26));
  const generatedAt = now.toISOString();
  const weekStart = startOfWeek(new Date(now.getTime() - (weeks - 1) * WEEK_MS));

  const rows: AdminUsersRow[] = [];
  const timeline = new Map<string, AdminUsersTimelinePoint>();
  const roleTotals = new Map<AdminUserRoleKey, number>();
  const statusTotals = new Map<AdminUserStatusKey, number>();

  for (let i = 0; i < weeks; i += 1) {
    const date = new Date(weekStart.getTime() + i * WEEK_MS);
    const key = date.toISOString().slice(0, 10);
    timeline.set(key, {
      week: key,
      label: formatWeekLabel(date),
      signups: 0,
      active: 0,
      pending: 0,
    });
  }

  const createdDates: Date[] = [];
  let onlineNow = 0;
  let pendingApprovals = 0;
  let activeUsers = 0;
  let trainerUsers = 0;
  let clientUsers = 0;

  for (const record of records) {
    const id = String(record.id);
    const displayName = record.name?.trim() || record.email?.trim() || `Utilizador ${id}`;
    const email = record.email?.trim() || null;
    const roleKey = normaliseRole(record.role);
    const roleLabel = ROLE_LABEL[roleKey];
    const statusKey = normaliseStatus(record.status, record.approved, record.active);
    const statusLabel = STATUS_LABEL[statusKey];
    const statusTone = STATUS_TONE[statusKey];
    const approved = Boolean(record.approved ?? (record.status ? record.status.toUpperCase() === 'ACTIVE' : true));
    const active = record.active ?? statusKey === 'active';
    const createdAt = toIsoOrNull(record.createdAt);
    const lastLoginAt = toIsoOrNull(record.lastLoginAt ?? record.lastSeenAt);
    const lastSeenAt = toIsoOrNull(record.lastSeenAt ?? record.lastLoginAt);
    const online = Boolean(record.online);

    const row: AdminUsersRow = {
      id,
      displayName,
      email,
      roleKey,
      roleLabel,
      statusKey,
      statusLabel,
      statusTone,
      approved,
      active,
      createdAt,
      lastLoginAt,
      lastSeenAt,
      online,
    };
    rows.push(row);

    roleTotals.set(roleKey, (roleTotals.get(roleKey) ?? 0) + 1);
    statusTotals.set(statusKey, (statusTotals.get(statusKey) ?? 0) + 1);

    if (online) onlineNow += 1;
    if (statusKey === 'pending' || statusKey === 'invited' || !approved) pendingApprovals += 1;
    if (statusKey === 'active') activeUsers += 1;
    if (roleKey === 'trainer') trainerUsers += 1;
    if (roleKey === 'client') clientUsers += 1;

    const created = parseDate(createdAt);
    if (created) {
      createdDates.push(created);
      const key = startOfWeek(created).toISOString().slice(0, 10);
      const entry = timeline.get(key);
      if (entry) {
        entry.signups += 1;
        if (statusKey === 'active') entry.active += 1;
        if (statusKey === 'pending' || statusKey === 'invited') entry.pending += 1;
      }
    }
  }

  const totalUsers = rows.length;
  const last30Window = now.getTime() - 30 * DAY_MS;
  const prev30Window = now.getTime() - 60 * DAY_MS;

  const signups30 = createdDates.filter((date) => date.getTime() >= last30Window).length;
  const signupsPrev30 = createdDates.filter((date) => date.getTime() >= prev30Window && date.getTime() < last30Window).length;
  const trend30 = formatTrend(signups30, signupsPrev30);

  const hero: AdminUsersDashboardData['hero'] = [
    {
      key: 'total',
      label: 'Total de utilizadores',
      value: formatNumber(totalUsers),
      hint: totalUsers > 0 ? `${formatPercent(activeUsers / (totalUsers || 1))} ativos` : undefined,
      tone: 'neutral',
    },
    {
      key: 'signups30',
      label: 'Novos (30d)',
      value: formatNumber(signups30),
      trend: trend30,
      tone: signups30 >= signupsPrev30 ? 'positive' : 'warning',
    },
    {
      key: 'trainers',
      label: 'Treinadores',
      value: formatNumber(trainerUsers),
      hint: totalUsers > 0 ? `${formatPercent(trainerUsers / (totalUsers || 1))} da base` : undefined,
      tone: 'neutral',
    },
    {
      key: 'pending',
      label: 'Aprovações pendentes',
      value: formatNumber(pendingApprovals),
      hint: onlineNow > 0 ? `${formatNumber(onlineNow)} online agora` : undefined,
      tone: pendingApprovals > 0 ? 'warning' : 'positive',
    },
  ];

  const roleDistribution: AdminUsersDistribution[] = (['admin', 'trainer', 'client', 'unknown'] as AdminUserRoleKey[])
    .map((key) => {
      const total = roleTotals.get(key) ?? 0;
      return {
        key,
        label: ROLE_LABEL[key],
        total,
        percentage: totalUsers > 0 ? (total / totalUsers) * 100 : 0,
        tone: key === 'trainer' ? ('info' as const) : key === 'admin' ? ('neutral' as const) : undefined,
      };
    })
    .filter((entry) => entry.total > 0);

  const statusDistribution: AdminUsersDistribution[] = (['active', 'pending', 'invited', 'suspended', 'disabled', 'unknown'] as AdminUserStatusKey[])
    .map((key) => {
      const total = statusTotals.get(key) ?? 0;
      return {
        key,
        label: STATUS_LABEL[key],
        total,
        percentage: totalUsers > 0 ? (total / totalUsers) * 100 : 0,
        tone: STATUS_TONE[key],
      };
    })
    .filter((entry) => entry.total > 0);

  const onlineHighlights = rows
    .filter((row) => row.online)
    .sort((a, b) => {
      const aSeen = parseDate(a.lastSeenAt)?.getTime() ?? 0;
      const bSeen = parseDate(b.lastSeenAt)?.getTime() ?? 0;
      return bSeen - aSeen;
    })
    .slice(0, 8)
    .map(buildHighlight);

  const approvalHighlights = rows
    .filter((row) => row.statusKey === 'pending' || row.statusKey === 'invited' || !row.approved)
    .sort((a, b) => {
      const aDate = parseDate(a.createdAt)?.getTime() ?? 0;
      const bDate = parseDate(b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 8)
    .map(buildHighlight);

  const recentHighlights = rows
    .filter((row) => Boolean(row.createdAt))
    .sort((a, b) => {
      const aDate = parseDate(a.createdAt)?.getTime() ?? 0;
      const bDate = parseDate(b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 8)
    .map(buildHighlight);

  const timelinePoints = Array.from(timeline.values());

  return {
    supabase: Boolean(opts.supabase),
    fallback: !opts.supabase,
    updatedAt: generatedAt,
    hero,
    timeline: timelinePoints,
    roles: roleDistribution,
    statuses: statusDistribution,
    online: onlineHighlights,
    approvals: approvalHighlights,
    recent: recentHighlights,
    rows,
  };
}
