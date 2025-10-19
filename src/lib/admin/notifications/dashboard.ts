import {
  type AdminNotificationBacklogRow,
  type AdminNotificationCampaignStat,
  type AdminNotificationChannelShare,
  type AdminNotificationDistributionSegment,
  type AdminNotificationHeroMetric,
  type AdminNotificationHighlight,
  type AdminNotificationListRow,
  type AdminNotificationRow,
  type AdminNotificationTimelinePoint,
  type AdminNotificationsDashboardData,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

function toIso(value: unknown): string | null {
  if (!value) return null;
  try {
    const date = value instanceof Date ? value : new Date(value as string | number);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function diffHours(start: string | null, end: Date): number | null {
  const startDate = parseDate(start);
  if (!startDate) return null;
  const diff = end.getTime() - startDate.getTime();
  if (!Number.isFinite(diff)) return null;
  return diff / 3_600_000;
}

function normaliseString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normaliseChannel(value: unknown): string | null {
  const label = normaliseString(value);
  if (!label) return null;
  const lower = label.toLowerCase();
  if (lower.includes('email')) return 'Email';
  if (lower.includes('push')) return 'Push';
  if (lower.includes('sms')) return 'SMS';
  if (lower.includes('app')) return 'App';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function stableHash(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    hash = (hash << 5) - hash + code;
    hash |= 0; // eslint-disable-line no-bitwise
  }
  return Math.abs(hash).toString(36);
}

function resolveNotificationId(row: Record<string, any>): string {
  const primaryKeys = ['id', 'notification_id', 'uid', 'reference'];
  for (const key of primaryKeys) {
    const value = row[key];
    if (value == null) continue;
    const stringValue = String(value).trim();
    if (stringValue) return stringValue;
  }

  const secondaryKeys = [
    'created_at',
    'inserted_at',
    'sent_at',
    'dispatched_at',
    'createdAt',
    'title',
    'subject',
    'body',
    'message',
  ];
  for (const key of secondaryKeys) {
    const value = row[key];
    if (value == null) continue;
    const stringValue = String(value).trim();
    if (stringValue) {
      return `notification-${stableHash(`${key}:${stringValue}`)}`;
    }
  }

  try {
    return `notification-${stableHash(JSON.stringify(row))}`;
  } catch {
    return `notification-${Date.now().toString(36)}`;
  }
}

export function mapNotificationRow(row: Record<string, any>): AdminNotificationRow {
  const createdAt = toIso(row.created_at ?? row.inserted_at ?? row.createdAt ?? row.created);
  const sentAt = toIso(row.sent_at ?? row.delivered_at ?? row.dispatched_at ?? createdAt);
  const title = normaliseString(row.title ?? row.subject ?? row.heading ?? row.summary);
  const type = normaliseString(row.type ?? row.kind ?? row.category);
  const channel = normaliseChannel(row.channel ?? row.medium ?? row.delivery_channel ?? row.platform);
  const audience = normaliseString(row.audience ?? row.segment ?? row.target);
  const metadata = row.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : null;
  return {
    id: resolveNotificationId(row),
    userId: row.user_id != null ? String(row.user_id) : row.uid != null ? String(row.uid) : null,
    title,
    body: normaliseString(row.body ?? row.message ?? row.content) ?? null,
    type,
    channel,
    audience,
    read: Boolean(row.read ?? row.is_read ?? row.opened ?? false),
    createdAt,
    sentAt,
    metadata,
  };
}

function computeHeroMetrics(rows: AdminNotificationRow[], now: Date): {
  metrics: AdminNotificationHeroMetric[];
  unreadCritical: number;
  readRate: number | null;
  sent7d: number;
} {
  const total = rows.length;
  const read = rows.filter((row) => row.read).length;
  const unread = total - read;
  const sent7d = rows.filter((row) => {
    const sentAt = parseDate(row.sentAt ?? row.createdAt);
    if (!sentAt) return false;
    return now.getTime() - sentAt.getTime() <= 7 * DAY_MS;
  }).length;
  const unreadCritical = rows.filter((row) => {
    if (row.read) return false;
    const createdAt = parseDate(row.createdAt);
    if (!createdAt) return false;
    return now.getTime() - createdAt.getTime() > 48 * 3_600_000;
  }).length;
  const readRate = total ? (read / total) * 100 : null;
  const metrics: AdminNotificationHeroMetric[] = [
    {
      id: 'notifications-total',
      label: 'Notificações listadas',
      value: numberFormatter.format(total),
      helper: unread ? `${numberFormatter.format(unread)} por ler` : 'Todas as mensagens lidas',
      tone: unread ? 'warning' : 'positive',
    },
    {
      id: 'notifications-read-rate',
      label: 'Taxa de leitura',
      value: readRate != null ? `${percentFormatter.format(readRate)}%` : '—',
      helper: total ? `${numberFormatter.format(read)} lidas` : 'Sem envios registados',
      tone: readRate != null && readRate >= 70 ? 'positive' : readRate != null && readRate < 40 ? 'danger' : 'info',
    },
    {
      id: 'notifications-week',
      label: 'Enviadas (7 dias)',
      value: numberFormatter.format(sent7d),
      helper: sent7d ? 'Campanhas activas esta semana' : 'Sem campanhas recentes',
      tone: sent7d ? 'primary' : 'info',
    },
    {
      id: 'notifications-unread',
      label: 'Pendentes críticos',
      value: numberFormatter.format(unreadCritical),
      helper: unreadCritical ? 'Acima de 48h sem leitura' : 'Tudo dentro do SLA',
      tone: unreadCritical ? 'warning' : 'positive',
    },
  ];
  return { metrics, unreadCritical, readRate, sent7d };
}

function computeTimeline(rows: AdminNotificationRow[], now: Date): AdminNotificationTimelinePoint[] {
  const points = new Map<string, { sent: number; read: number; unread: number }>();
  for (let i = 0; i < 14; i += 1) {
    const date = new Date(now.getTime() - i * DAY_MS);
    date.setHours(0, 0, 0, 0);
    points.set(date.toISOString(), { sent: 0, read: 0, unread: 0 });
  }
  rows.forEach((row) => {
    const created = parseDate(row.createdAt ?? row.sentAt);
    if (created) {
      created.setHours(0, 0, 0, 0);
      const key = created.toISOString();
      if (!points.has(key)) points.set(key, { sent: 0, read: 0, unread: 0 });
      const bucket = points.get(key)!;
      bucket.sent += 1;
      if (row.read) bucket.read += 1;
      else bucket.unread += 1;
    }
  });
  return Array.from(points.entries())
    .map(([date, value]) => ({ date, ...value }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function computeDistribution(rows: AdminNotificationRow[]): AdminNotificationDistributionSegment[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.type ?? 'Outros';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, count]) => {
      const lower = key.toLowerCase();
      let tone: AdminNotificationDistributionSegment['tone'];
      if (lower.includes('alerta')) tone = 'danger';
      else if (lower.includes('campanha')) tone = 'primary';
      else tone = 'neutral';
      return {
        id: key,
        label: key,
        count,
        tone,
      };
    })
    .sort((a, b) => b.count - a.count);
}

function computeChannels(rows: AdminNotificationRow[]): AdminNotificationChannelShare[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.channel ?? 'Desconhecido';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, label: id, count }))
    .sort((a, b) => b.count - a.count);
}

function computeCampaigns(rows: AdminNotificationRow[]): AdminNotificationCampaignStat[] {
  const campaigns = new Map<string, { title: string; sent: number; read: number }>();
  rows.forEach((row) => {
    const key = row.title ?? 'Sem título';
    if (!campaigns.has(key)) campaigns.set(key, { title: key, sent: 0, read: 0 });
    const bucket = campaigns.get(key)!;
    bucket.sent += 1;
    if (row.read) bucket.read += 1;
  });
  return Array.from(campaigns.entries())
    .map(([id, bucket]) => ({
      id,
      title: bucket.title,
      sent: bucket.sent,
      read: bucket.read,
      openRate: bucket.sent ? (bucket.read / bucket.sent) * 100 : null,
    }))
    .sort((a, b) => b.sent - a.sent)
    .slice(0, 6);
}

function computeBacklog(rows: AdminNotificationRow[], now: Date): AdminNotificationBacklogRow[] {
  return rows
    .filter((row) => !row.read)
    .map((row) => ({
      id: row.id,
      title: row.title,
      userId: row.userId,
      createdAt: row.createdAt,
      waitingHours: diffHours(row.createdAt, now) ?? 0,
    }))
    .sort((a, b) => b.waitingHours - a.waitingHours)
    .slice(0, 6);
}

function buildHighlights({
  unreadCritical,
  readRate,
  sent7d,
  channels,
}: {
  unreadCritical: number;
  readRate: number | null;
  sent7d: number;
  channels: AdminNotificationChannelShare[];
}): AdminNotificationHighlight[] {
  const highlights: AdminNotificationHighlight[] = [];
  if (unreadCritical > 0) {
    highlights.push({
      id: 'highlight-backlog',
      title: `${numberFormatter.format(unreadCritical)} alertas sem leitura`,
      description: 'Segue com a equipa de suporte para desbloquear mensagens importantes.',
      tone: 'warning',
    });
  } else {
    highlights.push({
      id: 'highlight-backlog-ok',
      title: 'Inbox controlada',
      description: 'Todas as notificações foram lidas nas últimas 48 horas.',
      tone: 'positive',
    });
  }
  if (readRate != null) {
    highlights.push({
      id: 'highlight-read',
      title: `${percentFormatter.format(readRate)}% de leitura`,
      description:
        readRate >= 70
          ? 'As campanhas estão a gerar bom engagement.'
          : 'Considera reforçar o assunto e CTA das mensagens.',
      tone: readRate >= 70 ? 'positive' : 'info',
    });
  }
  if (sent7d > 0) {
    highlights.push({
      id: 'highlight-week',
      title: `${numberFormatter.format(sent7d)} envios esta semana`,
      description: 'Garante que os segmentos estão actualizados para evitar spam.',
      tone: 'info',
    });
  }
  if (channels.length > 0) {
    const top = channels[0];
    highlights.push({
      id: 'highlight-channel',
      title: `Canal dominante: ${top.label}`,
      description: `${numberFormatter.format(top.count)} envios recentes via ${top.label}.`,
      tone: 'info',
    });
  }
  return highlights.slice(0, 4);
}

export function buildAdminNotificationsDashboard(
  rows: AdminNotificationRow[],
  opts: { source: 'supabase' | 'fallback'; now?: Date; total?: number; supabaseConfigured?: boolean },
): AdminNotificationsDashboardData {
  const now = opts.now ?? new Date();
  const { metrics, unreadCritical, readRate, sent7d } = computeHeroMetrics(rows, now);
  const timeline = computeTimeline(rows, now);
  const types = computeDistribution(rows);
  const channels = computeChannels(rows);
  const campaigns = computeCampaigns(rows);
  const backlog = computeBacklog(rows, now);
  const highlights = buildHighlights({ unreadCritical, readRate, sent7d, channels });

  return {
    ok: true,
    source: opts.source,
    generatedAt: now.toISOString(),
    sampleSize: rows.length,
    datasetSize: opts.total ?? rows.length,
    hero: metrics,
    highlights,
    timeline,
    types,
    channels,
    campaigns,
    backlog,
    _supabaseConfigured: opts.supabaseConfigured,
  };
}

export function mapNotificationsToList(rows: AdminNotificationRow[]): AdminNotificationListRow[] {
  return rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    title: row.title,
    body: row.body,
    type: row.type,
    read: row.read,
    created_at: row.createdAt,
  }));
}

