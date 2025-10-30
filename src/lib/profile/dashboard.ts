import { formatDistanceToNowStrict } from 'date-fns';
import { pt } from 'date-fns/locale';

import { buildClientSessionDashboard } from '@/lib/sessions/dashboard';
import type { ClientSession, SessionRequest } from '@/lib/sessions/types';

import type {
  ProfileActivity,
  ProfileCompletionItem,
  ProfileCompletionState,
  ProfileDashboardData,
  ProfileDevice,
  ProfileHighlight,
  ProfileHeroMetric,
  ProfileNotificationSnapshot,
  ProfilePreferenceSnapshot,
  ProfileSessionSnapshot,
  ProfileTimelinePoint,
} from './types';
import type { ProfileAccount } from './types';

const DAY_MS = 86_400_000;

const percentFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const hoursFormatter = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('pt-PT');

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});


export type ProfileNotificationRow = {
  id: string;
  type: string | null;
  read: boolean;
  created_at: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ProfileDeviceRow = {
  id: string;
  name: string | null;
  platform: string | null;
  device: string | null;
  user_agent: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProfileEventRow = {
  id: string;
  kind: string | null;
  action: string | null;
  category: string | null;
  note: string | null;
  created_at: string | null;
  details?: Record<string, unknown> | null;
};

export type BuildProfileDashboardOptions = {
  now?: Date;
};

export type ProfileDashboardSource = {
  account: ProfileAccount;
  sessions: ClientSession[];
  requests: SessionRequest[];
  notifications: ProfileNotificationRow[];
  devices: ProfileDeviceRow[];
  events: ProfileEventRow[];
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatRelative(value: string | null | undefined, now: Date): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: pt });
  } catch (error) {
    console.warn('[profile-dashboard] relative format failed', error);
    return '—';
  }
}

function formatDate(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return dateFormatter.format(date);
  } catch (error) {
    console.warn('[profile-dashboard] day format failed', error);
    return '—';
  }
}

function formatHours(value: number): string {
  if (!Number.isFinite(value)) return '0h';
  return `${hoursFormatter.format(value)} h`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return percentFormatter.format(Math.max(value, 0) / 100);
}

function describeTrend(delta: number): { direction: 'up' | 'down' | 'neutral'; label: string } {
  if (!Number.isFinite(delta) || delta === 0) {
    return { direction: 'neutral', label: 'Sem variação' };
  }
  const direction = delta > 0 ? 'up' : 'down';
  const abs = Math.abs(delta);
  return {
    direction,
    label: `${delta > 0 ? '+' : '−'}${hoursFormatter.format(abs)} h`,
  };
}

function computeCompletion(account: ProfileAccount): ProfileCompletionState {
  const fields: Array<[key: keyof ProfileAccount, ProfileCompletionItem]> = [
    ['avatarUrl', { id: 'avatar', label: 'Fotografia de perfil', action: 'Adiciona uma fotografia recente.' }],
    ['phone', { id: 'phone', label: 'Contacto telefónico', action: 'Define um número de telemóvel.' }],
    ['bio', { id: 'bio', label: 'Biografia', action: 'Partilha objectivos e contexto com a equipa.' }],
    ['birthDate', { id: 'birthDate', label: 'Data de nascimento', action: 'Actualiza a tua data de nascimento.' }],
    ['username', { id: 'username', label: 'Username público', action: 'Escolhe um identificador único.' }],
    ['name', { id: 'name', label: 'Nome completo', action: 'Indica como preferes ser tratado.' }],
  ];

  const total = fields.length;
  let completed = 0;
  const missing: ProfileCompletionItem[] = [];

  fields.forEach(([key, item]) => {
    const value = account[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      completed += 1;
    } else {
      missing.push(item);
    }
  });

  const percentage = Math.round((completed / total) * 100);
  return { percentage, missing };
}

function pickFavouriteTrainer(sessions: ClientSession[]): string | null {
  if (!sessions.length) return null;
  const counter = new Map<string, { name: string | null; count: number }>();
  sessions.forEach((session) => {
    const key = session.trainerId ?? session.trainerEmail ?? session.trainerName ?? 'unknown';
    const existing = counter.get(key) ?? { name: session.trainerName ?? session.trainerEmail ?? null, count: 0 };
    existing.count += 1;
    if (!existing.name && session.trainerName) existing.name = session.trainerName;
    counter.set(key, existing);
  });

  let favourite: { name: string | null; count: number } | null = null;
  counter.forEach((entry) => {
    if (!favourite || entry.count > favourite.count) {
      favourite = entry;
    }
  });

  if (!favourite || favourite.count <= 0) {
    return null;
  }

  if (typeof favourite.name === 'string') {
    const trimmed = favourite.name.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return 'o teu Personal Trainer preferido';
}

function buildHeroMetrics(
  account: ProfileAccount,
  sessionsSnapshot: ProfileSessionSnapshot,
  notificationsSnapshot: ProfileNotificationSnapshot,
  now: Date,
): ProfileHeroMetric[] {
  return [
    {
      id: 'attendance-rate',
      label: 'Taxa de presença',
      value: formatPercent(sessionsSnapshot.attendanceRate),
      helper:
        sessionsSnapshot.lastCompletedAt != null
          ? `Última sessão ${formatRelative(sessionsSnapshot.lastCompletedAt, now)}`
          : 'Ainda sem sessões concluídas',
      tone: sessionsSnapshot.attendanceRate >= 85 ? 'success' : sessionsSnapshot.attendanceRate >= 60 ? 'warning' : 'danger',
    },
    {
      id: 'upcoming-sessions',
      label: 'Próximas sessões',
      value: numberFormatter.format(sessionsSnapshot.upcoming),
      helper:
        sessionsSnapshot.nextSessionAt != null
          ? `Próxima sessão ${formatRelative(sessionsSnapshot.nextSessionAt, now)}`
          : 'Sem sessões agendadas',
      tone: sessionsSnapshot.upcoming > 0 ? 'primary' : 'neutral',
    },
    {
      id: 'hours-weekly',
      label: 'Horas agendadas (7d)',
      value: formatHours(sessionsSnapshot.hours7d),
      helper: 'Variação vs. semana anterior',
      tone: sessionsSnapshot.hours7d >= 2 ? 'success' : sessionsSnapshot.hours7d > 0 ? 'primary' : 'warning',
      trend: describeTrend(sessionsSnapshot.hoursDelta),
    },
    {
      id: 'notifications-unread',
      label: 'Alertas por ler',
      value: numberFormatter.format(notificationsSnapshot.unread),
      helper:
        notificationsSnapshot.lastDeliveryAt
          ? `Último alerta ${formatRelative(notificationsSnapshot.lastDeliveryAt, now)}`
          : 'Sem alertas recentes',
      tone: notificationsSnapshot.unread > 0 ? 'warning' : 'neutral',
    },
  ];
}

function buildTimeline(points: ReturnType<typeof buildClientSessionDashboard>['timeline']): ProfileTimelinePoint[] {
  return points.map((point) => ({
    date: point.date,
    label: formatDate(point.date),
    scheduled: point.scheduled,
    completed: point.confirmed,
    cancelled: point.cancelled,
  }));
}

function buildHighlights(
  account: ProfileAccount,
  completion: ProfileCompletionState,
  sessionsSnapshot: ProfileSessionSnapshot,
  notificationsSnapshot: ProfileNotificationSnapshot,
  now: Date,
): ProfileHighlight[] {
  const highlights: ProfileHighlight[] = [];

  if (sessionsSnapshot.nextSessionAt) {
    highlights.push({
      id: 'next-session',
      title: 'Preparar próxima sessão',
      description: `Não te esqueças de confirmar presença ${formatRelative(sessionsSnapshot.nextSessionAt, now)}.`,
      tone: 'info',
    });
  }

  if (notificationsSnapshot.unread > 0) {
    highlights.push({
      id: 'unread-alerts',
      title: `${notificationsSnapshot.unread} alertas por ler`,
      description: 'Revê as notificações para não perderes actualizações importantes.',
      tone: 'warning',
    });
  }

  if (completion.percentage < 80) {
    highlights.push({
      id: 'complete-profile',
      title: 'Completa o teu perfil',
      description: `Faltam ${completion.missing.length} detalhes para chegares a 100%.`,
      tone: 'info',
    });
  }

  if (sessionsSnapshot.favouriteTrainer) {
    const favouriteName = sessionsSnapshot.favouriteTrainer;
    highlights.push({
      id: 'favourite-trainer',
      title: 'PT de confiança',
      description: `Manténs uma cadência consistente com ${favouriteName}.`,
      tone: 'success',
    });
  }

  if (sessionsSnapshot.attendanceRate >= 90 && sessionsSnapshot.total >= 5) {
    highlights.push({
      id: 'attendance-star',
      title: 'Excelente consistência!',
      description: 'Mantém a disciplina — a tua taxa de presença é de topo.',
      tone: 'success',
    });
  }

  if (!highlights.length) {
    highlights.push({
      id: 'profile-ready',
      title: 'Perfil actualizado',
      description: `Olá ${account.name ?? account.email}, tudo pronto para treinar.`,
      tone: 'success',
    });
  }

  return highlights.slice(0, 4);
}

function buildNotificationsSnapshot(
  rows: ProfileNotificationRow[],
  now: Date,
): ProfileNotificationSnapshot {
  const unread = rows.filter((row) => !row.read).length;
  const since30 = now.getTime() - 30 * DAY_MS;
  const delivered30d = rows.filter((row) => {
    const createdAt = parseDate(row.created_at);
    return createdAt && createdAt.getTime() >= since30;
  }).length;
  const lastDelivery = rows.reduce<string | null>((acc, row) => {
    const createdAt = parseDate(row.created_at);
    if (!createdAt) return acc;
    if (!acc) return row.created_at ?? null;
    const prev = parseDate(acc);
    if (!prev || createdAt > prev) return row.created_at ?? null;
    return acc;
  }, null);

  const nextReminder = rows
    .filter((row) => row.type?.includes('reminder') && !row.read)
    .map((row) => row.created_at)
    .find(Boolean);

  return {
    total: rows.length,
    unread,
    delivered30d,
    lastDeliveryAt: lastDelivery,
    nextReminderAt: nextReminder ?? null,
  } satisfies ProfileNotificationSnapshot;
}

function determineDevicePlatform(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Web';
  const agent = userAgent.toLowerCase();
  if (agent.includes('iphone') || agent.includes('ipad') || agent.includes('ios')) return 'iOS';
  if (agent.includes('android')) return 'Android';
  if (agent.includes('mac os') || agent.includes('macintosh')) return 'macOS';
  if (agent.includes('windows')) return 'Windows';
  if (agent.includes('linux')) return 'Linux';
  return 'Web';
}

function describeDeviceName(row: ProfileDeviceRow): string {
  if (row.name && row.name.trim()) return row.name.trim();
  if (row.device && row.device.trim()) return row.device.trim();
  const platform = determineDevicePlatform(row.user_agent);
  return `Sessão ${platform}`;
}

function determineDeviceRisk(row: ProfileDeviceRow, now: Date): 'low' | 'medium' | 'high' {
  const updatedAt = parseDate(row.updated_at ?? row.created_at);
  if (!updatedAt) return 'medium';
  const diff = now.getTime() - updatedAt.getTime();
  if (diff <= 30 * DAY_MS) return 'low';
  if (diff <= 60 * DAY_MS) return 'medium';
  return 'high';
}

function buildDevices(rows: ProfileDeviceRow[], now: Date): ProfileDevice[] {
  return rows
    .map((row) => ({
      id: row.id,
      name: describeDeviceName(row),
      platform: determineDevicePlatform(row.user_agent),
      lastActiveAt: row.updated_at ?? row.created_at ?? null,
      location: null,
      risk: determineDeviceRisk(row, now),
    }))
    .sort((a, b) => {
      const aTime = parseDate(a.lastActiveAt)?.getTime() ?? 0;
      const bTime = parseDate(b.lastActiveAt)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 6);
}

function buildPreferences(
  account: ProfileAccount,
  devices: ProfileDevice[],
  notifications: ProfileNotificationSnapshot,
  now: Date,
): ProfilePreferenceSnapshot[] {
  const emailEnabled = true;
  const pushEnabled = devices.length > 0;
  const smsEnabled = Boolean(account.phone && account.phone.trim().length >= 9);

  return [
    {
      channel: 'email',
      label: 'Resumo por email',
      enabled: emailEnabled,
      helper: emailEnabled ? 'Recebes alertas críticos e resumos semanais.' : 'Activa o resumo para receberes alertas por email.',
      updatedAt: notifications.lastDeliveryAt,
    },
    {
      channel: 'push',
      label: 'Notificações push',
      enabled: pushEnabled,
      helper: pushEnabled ? 'Sessões e lembretes sincronizados com os teus dispositivos.' : 'Activa no navegador para receber alertas instantâneos.',
      updatedAt: devices[0]?.lastActiveAt ?? null,
    },
    {
      channel: 'sms',
      label: 'SMS urgentes',
      enabled: smsEnabled,
      helper: smsEnabled ? 'SMS activado para lembretes críticos.' : 'Adiciona um número de telefone para receberes SMS.',
      updatedAt: smsEnabled ? account.updatedAt ?? null : null,
    },
  ];
}

function describeEvent(row: ProfileEventRow): ProfileActivity {
  const kind = (row.kind ?? row.action ?? '').toLowerCase();
  const category = (row.category ?? '').toLowerCase();
  let title = 'Actualização de conta';
  let description = row.note ?? 'Evento registado na tua conta.';
  let tone: ProfileActivity['tone'] = 'info';

  if (kind.includes('login')) {
    title = 'Sessão iniciada';
    description = 'Acesso confirmado na plataforma.';
    tone = 'success';
  } else if (kind.includes('logout')) {
    title = 'Sessão terminada';
    description = 'Saíste da plataforma com sucesso.';
    tone = 'info';
  } else if (kind.includes('password')) {
    title = 'Palavra-passe actualizada';
    description = 'A tua palavra-passe foi alterada.';
    tone = 'success';
  } else if (category.includes('notification')) {
    title = 'Preferências de notificação revistas';
    tone = 'info';
  } else if (category.includes('security')) {
    title = 'Alerta de segurança';
    tone = 'warning';
  }

  return {
    id: row.id,
    title,
    description,
    at: row.created_at ?? null,
    tone,
  };
}

function buildActivity(events: ProfileEventRow[]): ProfileActivity[] {
  return events
    .map(describeEvent)
    .sort((a, b) => {
      const aTime = parseDate(a.at)?.getTime() ?? 0;
      const bTime = parseDate(b.at)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 8);
}

export function buildProfileDashboard(
  source: ProfileDashboardSource,
  options: BuildProfileDashboardOptions = {},
): ProfileDashboardData {
  const now = options.now ?? new Date();

  const completion = computeCompletion(source.account);
  const notifications = buildNotificationsSnapshot(source.notifications, now);
  const sessionsDashboard = buildClientSessionDashboard(source.sessions, source.requests, { supabase: true, now });
  const sessions = {
    total: sessionsDashboard.metrics.totalSessions,
    upcoming: sessionsDashboard.metrics.upcomingCount,
    attendanceRate: sessionsDashboard.metrics.attendanceRate,
    cancellationRate: sessionsDashboard.metrics.cancellationRate,
    hours7d: sessionsDashboard.metrics.hoursBooked7d,
    hoursDelta: sessionsDashboard.metrics.hoursBookedDelta,
    nextSessionAt: sessionsDashboard.metrics.nextSessionAt,
    lastCompletedAt: sessionsDashboard.metrics.lastCompletedAt,
    favouriteTrainer: pickFavouriteTrainer(source.sessions),
  } satisfies ProfileSessionSnapshot;
  const hero = buildHeroMetrics(source.account, sessions, notifications, now);
  const timeline = buildTimeline(sessionsDashboard.timeline);
  const highlights = buildHighlights(source.account, completion, sessions, notifications, now);
  const devices = buildDevices(source.devices, now);
  const preferences = buildPreferences(source.account, devices, notifications, now);
  const activity = buildActivity(source.events);

  return {
    account: source.account,
    hero,
    timeline,
    highlights,
    completion,
    notifications,
    sessions,
    devices,
    preferences,
    activity,
    generatedAt: now.toISOString(),
  } satisfies ProfileDashboardData;
}
