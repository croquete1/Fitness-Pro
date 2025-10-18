import { formatDistanceToNowStrict } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  type SettingsAccountSnapshot,
  type SettingsActivity,
  type SettingsContext,
  type SettingsDashboardData,
  type SettingsDashboardHighlight,
  type SettingsDashboardHeroMetric,
  type SettingsDashboardTimelinePoint,
  type SettingsDevice,
  type SettingsNotificationChannel,
  type SettingsNotificationSnapshot,
  type SettingsSecurityEvent,
} from './types';

const DAY_MS = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const numberFormatter = new Intl.NumberFormat('pt-PT');
const percentFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export type BuildSettingsDashboardOptions = {
  now?: Date;
  rangeDays?: number;
  previousEvents?: SettingsSecurityEvent[];
};

export type SettingsDashboardSource = {
  account: SettingsAccountSnapshot;
  notifications: SettingsNotificationSnapshot;
  events: SettingsSecurityEvent[];
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toStartOfDay(date: Date): Date {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toIsoDay(date: Date): string {
  return toStartOfDay(date).toISOString().slice(0, 10);
}

function formatRelative(value: string | null | undefined, now: Date): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: pt });
  } catch (error) {
    console.warn('[settings-dashboard] relative format failed', error);
    return '—';
  }
}

function formatDateTime(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return dateTimeFormatter.format(date);
  } catch (error) {
    console.warn('[settings-dashboard] datetime format failed', error);
    return '—';
  }
}

function formatSummaryFrequency(frequency: string): string {
  switch (frequency) {
    case 'daily':
      return 'Resumo diário';
    case 'weekly':
      return 'Resumo semanal';
    case 'monthly':
      return 'Resumo mensal';
    case 'never':
      return 'Resumo desactivado';
    default:
      return 'Resumo automático';
  }
}

function buildTimeline(rangeDays: number, start: Date): Map<string, SettingsDashboardTimelinePoint> {
  const buckets = new Map<string, SettingsDashboardTimelinePoint>();
  for (let offset = 0; offset < rangeDays; offset += 1) {
    const current = new Date(start.getTime() + offset * DAY_MS);
    const iso = toIsoDay(current);
    buckets.set(iso, {
      iso,
      label: dateFormatter.format(current),
      logins: 0,
      failures: 0,
      recoveries: 0,
      mfa: 0,
      devices: 0,
    });
  }
  return buckets;
}

function calcTrend(current: number, previous: number): { direction: 'up' | 'down' | 'neutral'; label: string } {
  if (previous <= 0 && current <= 0) {
    return { direction: 'neutral', label: 'Sem variação' };
  }
  if (previous <= 0) {
    return { direction: 'up', label: '+100%' };
  }
  const diff = current - previous;
  if (diff === 0) {
    return { direction: 'neutral', label: '0%' };
  }
  const ratio = diff / previous;
  const direction: 'up' | 'down' = diff > 0 ? 'up' : 'down';
  const label = `${diff > 0 ? '+' : ''}${percentFormatter.format(Math.min(Math.abs(ratio), 5))}`;
  return { direction, label };
}

function determineDeviceRisk(event: SettingsSecurityEvent): 'low' | 'medium' | 'high' {
  if (event.type === 'login_failed') return 'medium';
  if (event.type === 'device_revoked') return 'high';
  if (event.status === 'failed') return 'medium';
  return 'low';
}

function describeEvent(event: SettingsSecurityEvent): string {
  switch (event.type) {
    case 'login':
      return 'Sessão iniciada com sucesso.';
    case 'logout':
      return 'Sessão terminada.';
    case 'login_failed':
      return 'Tentativa de login falhada.';
    case 'mfa_challenge':
      return 'Desafio MFA validado.';
    case 'recovery':
      return 'Códigos de recuperação utilizados.';
    case 'password_change':
      return 'Palavra-passe actualizada.';
    case 'profile_update':
      return 'Perfil actualizado.';
    case 'notification_update':
      return 'Preferências de notificação revistas.';
    case 'device_revoked':
      return 'Sessão remota revogada.';
    default:
      return 'Evento de segurança registado.';
  }
}

function eventTone(event: SettingsSecurityEvent): 'info' | 'warning' | 'success' {
  if (event.type === 'login_failed' || event.status === 'failed') return 'warning';
  if (event.type === 'password_change' || event.type === 'notification_update' || event.type === 'profile_update') {
    return 'success';
  }
  return 'info';
}

export function buildSettingsDashboard(
  source: SettingsDashboardSource,
  options: BuildSettingsDashboardOptions = {},
): SettingsDashboardData {
  const now = options.now ?? new Date();
  const rangeDays = Math.max(7, options.rangeDays ?? 30);
  const end = toStartOfDay(now);
  const start = new Date(end.getTime() - (rangeDays - 1) * DAY_MS);

  const previousEvents = options.previousEvents ?? [];
  const timelineBuckets = buildTimeline(rangeDays, start);

  let loginSuccess = 0;
  let loginFailures = 0;

  for (const event of source.events) {
    const date = parseDate(event.createdAt);
    if (!date) continue;
    if (date < start || date > new Date(end.getTime() + DAY_MS - 1)) continue;
    const bucket = timelineBuckets.get(toIsoDay(date));
    if (!bucket) continue;

    switch (event.type) {
      case 'login':
        bucket.logins += 1;
        loginSuccess += 1;
        break;
      case 'logout':
        bucket.devices += 1;
        break;
      case 'login_failed':
        bucket.failures += 1;
        loginFailures += 1;
        break;
      case 'mfa_challenge':
        bucket.mfa += 1;
        break;
      case 'recovery':
        bucket.recoveries += 1;
        break;
      case 'device_revoked':
        bucket.devices += 1;
        break;
      default:
        break;
    }
  }

  const previousLogins = previousEvents.filter((event) => event.type === 'login' && event.status === 'success').length;
  const loginTrend = calcTrend(loginSuccess, previousLogins);

  const enabledChannels = [source.notifications.email, source.notifications.push, source.notifications.sms].filter(Boolean)
    .length;
  const totalChannels = 3;

  const hero: SettingsDashboardHeroMetric[] = [
    {
      id: 'account-age',
      label: 'Dias na plataforma',
      value: source.account.createdAt
        ? numberFormatter.format(
            Math.max(1, Math.round((now.getTime() - new Date(source.account.createdAt).getTime()) / DAY_MS)),
          )
        : '—',
      helper: source.account.createdAt ? `Desde ${formatDateTime(source.account.createdAt)}` : null,
    },
    {
      id: 'last-login',
      label: 'Último acesso',
      value: formatRelative(source.account.lastLoginAt, now),
      helper: source.account.lastLoginAt ? formatDateTime(source.account.lastLoginAt) : 'Sem registos recentes',
    },
    {
      id: 'range-logins',
      label: 'Sessões no período',
      value: numberFormatter.format(loginSuccess),
      trend: loginTrend,
      helper: `${numberFormatter.format(loginFailures)} falhas detectadas`,
    },
    {
      id: 'channels-active',
      label: 'Canais activos',
      value: `${enabledChannels}/${totalChannels}`,
      helper: enabledChannels === totalChannels ? 'Todos os canais ligados' : 'Revê os canais em falta',
    },
  ];

  const highlights: SettingsDashboardHighlight[] = [];
  if (!source.account.mfaEnabled) {
    highlights.push({
      id: 'mfa-warning',
      title: 'Activa a autenticação multifactor',
      description: 'Protege a tua conta adicionando um segundo factor de autenticação (SMS, app ou chave física).',
      tone: 'warning',
    });
  } else {
    highlights.push({
      id: 'mfa-enabled',
      title: 'MFA activo',
      description: 'A autenticação multifactor está activa para esta conta.',
      tone: 'success',
    });
  }

  if (!source.account.emailConfirmedAt) {
    highlights.push({
      id: 'email-unconfirmed',
      title: 'Confirma o email da conta',
      description: 'Ainda não detectámos a confirmação do email. Confirma para recuperar o acesso facilmente.',
      tone: 'warning',
    });
  }

  if (source.account.recoveryCodesRemaining !== null && source.account.recoveryCodesRemaining <= 3) {
    highlights.push({
      id: 'recovery-codes',
      title: 'Gera novos códigos de recuperação',
      description: 'Recomendamos ter pelo menos 5 códigos disponíveis para situações de emergência.',
      tone: 'info',
    });
  }

  if (source.notifications.summary === 'never') {
    highlights.push({
      id: 'digest-disabled',
      title: 'Resumo periódico desactivado',
      description: 'Activa os resumos automáticos para receberes um balanço regular das actividades.',
      tone: 'info',
    });
  }

  const channels: SettingsNotificationChannel[] = [
    {
      id: 'email',
      label: 'Email',
      enabled: source.notifications.email,
      description: 'Alertas, recibos e pedidos de sessão',
      updatedAt: source.notifications.updatedAt,
    },
    {
      id: 'push',
      label: 'Push',
      enabled: source.notifications.push,
      description: 'Notificações em tempo real na app',
      updatedAt: source.notifications.updatedAt,
    },
    {
      id: 'sms',
      label: 'SMS',
      enabled: source.notifications.sms,
      description: 'Alertas críticos e confirmações',
      updatedAt: source.notifications.updatedAt,
    },
  ];

  const deliveredCount = source.notifications.totalDeliveries30d ?? null;
  const failedCount = source.notifications.failedDeliveries30d ?? 0;
  const attemptedDeliveries = deliveredCount !== null ? deliveredCount + failedCount : failedCount;
  const successfulDeliveries = deliveredCount ?? Math.max(0, attemptedDeliveries - failedCount);
  const successRate = attemptedDeliveries > 0 ? successfulDeliveries / attemptedDeliveries : 1;

  const deliverabilityLabel = attemptedDeliveries
    ? `${numberFormatter.format(successfulDeliveries)} entregues de ${numberFormatter.format(attemptedDeliveries)}`
    : 'Sem envios recentes';

  const deviceMap = new Map<string, { device: SettingsDevice; lastSeenMs: number }>();
  for (const event of source.events) {
    const date = parseDate(event.createdAt);
    if (!date) continue;
    const key = event.device ?? event.ip ?? event.id;
    if (!key) continue;
    const existing = deviceMap.get(key);
    const label = event.device ?? `Dispositivo ${deviceMap.size + 1}`;
    const location = event.location ?? (event.ip ? `IP ${event.ip}` : 'Localização desconhecida');
    const relative = formatRelative(event.createdAt, now);
    const status: SettingsDevice['status'] = event.type === 'logout' || event.type === 'device_revoked' ? 'expired' : 'active';
    const risk = determineDeviceRisk(event);

    if (!existing) {
      deviceMap.set(key, {
        device: {
          id: key,
          label,
          location,
          lastSeen: formatDateTime(event.createdAt),
          relative,
          status,
          risk,
          channel: event.channel ?? null,
        },
        lastSeenMs: date.getTime(),
      });
    } else if (date.getTime() > existing.lastSeenMs) {
      existing.device.lastSeen = formatDateTime(event.createdAt);
      existing.device.relative = relative;
      existing.device.status = status;
      existing.device.risk = risk;
      existing.device.channel = event.channel ?? existing.device.channel ?? null;
      existing.device.location = location;
      existing.lastSeenMs = date.getTime();
    }
  }

  const devices = Array.from(deviceMap.values())
    .sort((a, b) => b.lastSeenMs - a.lastSeenMs)
    .map((entry) => entry.device);

  const timeline = Array.from(timelineBuckets.values());

  const activity: SettingsActivity[] = source.events
    .slice()
    .sort((a, b) => {
      const aDate = parseDate(a.createdAt) ?? new Date(0);
      const bDate = parseDate(b.createdAt) ?? new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 18)
    .map((event) => ({
      id: event.id,
      title: describeEvent(event),
      description: event.note ?? event.location ?? event.device ?? '—',
      when: formatDateTime(event.createdAt),
      relative: formatRelative(event.createdAt, now),
      type: event.type,
      tone: eventTone(event),
    }));

  return {
    generatedAt: now.toISOString(),
    rangeDays,
    rangeLabel: rangeDays === 30 ? 'Últimos 30 dias' : `Últimos ${rangeDays} dias`,
    hero,
    highlights,
    timeline,
    notifications: {
      summary: `${enabledChannels} de ${totalChannels} canais activos`,
      digest: {
        label: formatSummaryFrequency(source.notifications.summary),
        schedule:
          source.notifications.summary === 'never'
            ? 'Sem envio agendado'
            : `Próximo envio ${formatRelative(source.notifications.updatedAt, now)}`,
        helper:
          source.notifications.summary === 'never'
            ? 'Os resumos ajudam a acompanhar métricas e alertas sem entrar na aplicação.'
            : null,
      },
      channels,
      deliverability: {
        successRate,
        label: deliverabilityLabel,
      },
    },
    devices: devices.slice(0, 6),
    activity,
  } satisfies SettingsDashboardData;
}

export function toDashboardContext(
  context: SettingsContext,
): SettingsDashboardSource {
  return {
    account: context.account,
    notifications: context.notifications,
    events: [],
  } satisfies SettingsDashboardSource;
}
