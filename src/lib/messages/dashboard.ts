import {
  type MessageRecord,
  type MessagesDashboardData,
  type MessageChannelKey,
  type MessageConversationRow,
  type MessageDistributionSegment,
  type MessageHeroMetric,
  type MessageHighlight,
  type MessageListRow,
  type MessageTimelinePoint,
  type MessageDirection,
} from './types';

const DAY_MS = 86_400_000;

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });

const CHANNEL_LABEL: Record<MessageChannelKey, string> = {
  'in-app': 'App',
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
  call: 'Chamada',
  social: 'Social',
  unknown: 'Outro',
};

const CHANNEL_TONE: Record<MessageChannelKey, 'info' | 'positive' | 'warning' | 'critical' | 'neutral'> = {
  'in-app': 'info',
  whatsapp: 'positive',
  email: 'info',
  sms: 'warning',
  call: 'positive',
  social: 'info',
  unknown: 'neutral',
};

const RANGE_MIN = 7;
const RANGE_MAX = 90;

function clampRange(value: number | undefined | null): number {
  if (!Number.isFinite(value ?? null)) return 14;
  return Math.min(RANGE_MAX, Math.max(RANGE_MIN, Math.trunc(value!)));
}

function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(value: Date): Date {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDayLabel(value: Date): string {
  return dateFormatter.format(value);
}

function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(Number.isFinite(value) ? value : 0));
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return `${percentFormatter.format(value * 100)}%`;
}

function formatTrend(current: number, previous: number): string | null {
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

function formatDuration(minutes: number | null): string {
  if (!Number.isFinite(minutes) || minutes === null) return '—';
  const abs = Math.max(0, minutes);
  const hours = Math.floor(abs / 60);
  const mins = Math.round(abs % 60);
  if (hours >= 1) {
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
  if (mins >= 1) return `${mins}m`;
  return `${(abs * 60).toFixed(0)}s`;
}

function formatRelative(value: string | null, now: Date): string | null {
  const date = parseDate(value);
  if (!date) return null;
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = thresholds.find((item) => absMs < item.limit) ?? thresholds[thresholds.length - 1]!;
  const valueRounded = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function toIsoDay(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function normaliseChannel(value: string | null | undefined): MessageChannelKey {
  if (!value) return 'in-app';
  const key = value.toString().trim().toLowerCase();
  if (!key) return 'in-app';
  if (key.includes('whats')) return 'whatsapp';
  if (key.includes('email') || key.includes('@')) return 'email';
  if (key.includes('sms') || key.includes('text')) return 'sms';
  if (key.includes('call') || key.includes('phone')) return 'call';
  if (key.includes('insta') || key.includes('facebook') || key.includes('social')) return 'social';
  if (key.includes('app') || key.includes('in-app') || key.includes('platform')) return 'in-app';
  return 'unknown';
}

function directionFor(viewerId: string, record: MessageRecord): MessageDirection {
  if (record.fromId === viewerId) return 'outbound';
  if (record.toId === viewerId) return 'inbound';
  return 'internal';
}

function computeMedian(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

type ConversationAccumulator = {
  row: MessageConversationRow;
  channelCounts: Map<MessageChannelKey, number>;
  responseSum: number;
  responseCount: number;
};

export function buildMessagesDashboard(
  records: MessageRecord[],
  opts: { viewerId: string; now?: Date | string | number; rangeDays?: number },
): MessagesDashboardData {
  const viewerId = opts.viewerId;
  const now = parseDate(opts.now) ?? new Date();
  const rangeDays = clampRange(opts.rangeDays);
  const end = new Date(now.getTime());
  const start = startOfDay(new Date(end.getTime() - (rangeDays - 1) * DAY_MS));
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = startOfDay(new Date(previousEnd.getTime() - (rangeDays - 1) * DAY_MS));

  const timelineBuckets = new Map<string, MessageTimelinePoint>();
  for (let index = 0; index < rangeDays; index += 1) {
    const date = new Date(start.getTime() + index * DAY_MS);
    const day = toIsoDay(date);
    timelineBuckets.set(day, {
      day,
      label: formatDayLabel(date),
      inbound: 0,
      outbound: 0,
      replies: 0,
    });
  }

  const totals = {
    inbound: 0,
    outbound: 0,
    internal: 0,
    replies: 0,
    participants: new Set<string>(),
  };

  let previousTotal = 0;
  let previousOutbound = 0;
  let previousInbound = 0;
  let previousReplies = 0;

  const distributionCounts = new Map<MessageChannelKey, number>();
  const responseDurations: number[] = [];
  const pendingQueue = new Map<string, Date[]>();
  const pendingInRange = new Map<string, number>();
  const conversations = new Map<string, ConversationAccumulator>();
  const messages: MessageListRow[] = [];

  const sortedRecords = [...records].sort((a, b) => {
    const dateA = parseDate(a.sentAt)?.getTime() ?? 0;
    const dateB = parseDate(b.sentAt)?.getTime() ?? 0;
    return dateA - dateB;
  });

  for (const record of sortedRecords) {
    const sentAtDate = parseDate(record.sentAt);
    const direction = directionFor(viewerId, record);
    const channel = normaliseChannel(record.channel);
    const counterpartId = direction === 'outbound' ? record.toId : direction === 'inbound' ? record.fromId : null;
    const threadHint =
      typeof record.replyToId === 'string' && record.replyToId.trim().length > 0
        ? record.replyToId.trim()
        : record.id;
    const counterpartNameRaw = direction === 'outbound' ? record.toName : direction === 'inbound' ? record.fromName : null;
    const counterpartKey = counterpartId && counterpartId.trim().length > 0 ? counterpartId.trim() : null;
    const counterpartName =
      direction === 'internal'
        ? 'Equipa interna'
        : counterpartNameRaw?.trim() || (counterpartKey ? `Contacto ${counterpartKey.slice(0, 6)}` : 'Contacto desconhecido');
    const key =
      counterpartKey ?? (direction === 'internal' ? `internal-${threadHint}` : `unknown-${threadHint}`);
    if (direction !== 'internal' && counterpartKey) {
      totals.participants.add(counterpartKey);
    }
    const inRange = sentAtDate ? sentAtDate.getTime() >= start.getTime() && sentAtDate.getTime() <= end.getTime() : false;
    const isPreviousRange = sentAtDate ? sentAtDate.getTime() <= previousEnd.getTime() && sentAtDate.getTime() >= previousStart.getTime() : false;
    let responded = false;
    let replyMinutes: number | null = null;

    if (isPreviousRange) {
      previousTotal += 1;
      if (direction === 'outbound') previousOutbound += 1;
      if (direction === 'inbound') previousInbound += 1;
    }

    let conversation = conversations.get(key);
    if (!conversation) {
      conversation = {
        row: {
          id: key,
          counterpartId: counterpartKey,
          counterpartName,
          totalMessages: 0,
          inbound: 0,
          outbound: 0,
          internal: 0,
          lastDirection: direction,
          lastMessageAt: sentAtDate ? sentAtDate.toISOString() : null,
          averageResponseMinutes: null,
          pendingResponses: 0,
          mainChannel: channel,
          mainChannelLabel: CHANNEL_LABEL[channel],
        },
        channelCounts: new Map([[channel, 0]]),
        responseSum: 0,
        responseCount: 0,
      } satisfies ConversationAccumulator;
      conversations.set(key, conversation);
    }

    if (sentAtDate && (!conversation.row.lastMessageAt || sentAtDate.toISOString() >= (conversation.row.lastMessageAt ?? ''))) {
      conversation.row.lastMessageAt = sentAtDate.toISOString();
      conversation.row.lastDirection = direction;
    }

    if (inRange) {
      conversation.row.totalMessages += 1;
      if (direction === 'inbound') conversation.row.inbound += 1;
      if (direction === 'outbound') conversation.row.outbound += 1;
      if (direction === 'internal') conversation.row.internal += 1;
      conversation.channelCounts.set(channel, (conversation.channelCounts.get(channel) ?? 0) + 1);
    }

    if (direction === 'inbound') {
      const queue = pendingQueue.get(key) ?? [];
      queue.push(sentAtDate ?? new Date(start.getTime() - DAY_MS));
      pendingQueue.set(key, queue);
      if (inRange) {
        pendingInRange.set(key, (pendingInRange.get(key) ?? 0) + 1);
      }
    }

    if (direction === 'outbound') {
      const queue = pendingQueue.get(key);
      if (queue && queue.length) {
        const receivedAt = queue.shift() ?? null;
        if (queue.length === 0) pendingQueue.delete(key);
        if (receivedAt && sentAtDate) {
          const diff = sentAtDate.getTime() - receivedAt.getTime();
          const minutes = diff / 60_000;
          if (Number.isFinite(minutes) && minutes >= 0 && minutes < 14 * 24 * 60) {
            responded = true;
            replyMinutes = minutes;
            if (inRange) {
              responseDurations.push(minutes);
              totals.replies += 1;
              conversation.responseSum += minutes;
              conversation.responseCount += 1;
            }
          }
        }
        if (inRange && (pendingInRange.get(key) ?? 0) > 0) {
          pendingInRange.set(key, Math.max(0, (pendingInRange.get(key) ?? 0) - 1));
        }
      }
    }

    if (isPreviousRange && responded) {
      previousReplies += 1;
    }

    if (!inRange) {
      continue;
    }

    if (direction === 'inbound') totals.inbound += 1;
    if (direction === 'outbound') totals.outbound += 1;
    if (direction === 'internal') totals.internal += 1;

    const dayKey = sentAtDate ? toIsoDay(sentAtDate) : null;
    if (dayKey && timelineBuckets.has(dayKey)) {
      const bucket = timelineBuckets.get(dayKey)!;
      if (direction === 'inbound') bucket.inbound += 1;
      if (direction === 'outbound') bucket.outbound += 1;
      if (responded) bucket.replies += 1;
    }

    distributionCounts.set(channel, (distributionCounts.get(channel) ?? 0) + 1);

    messages.push({
      id: record.id,
      body: record.body ?? null,
      sentAt: sentAtDate ? sentAtDate.toISOString() : null,
      relative: formatRelative(sentAtDate ? sentAtDate.toISOString() : null, now),
      fromId: record.fromId ?? null,
      toId: record.toId ?? null,
      fromName: record.fromName ?? null,
      toName: record.toName ?? null,
      direction,
      channel,
      channelLabel: CHANNEL_LABEL[channel],
      responseMinutes:
        replyMinutes ?? (conversation.responseCount > 0 ? conversation.responseSum / conversation.responseCount : null),
    });
  }

  const pendingResponsesTotal = Array.from(pendingInRange.values()).reduce((sum, value) => sum + value, 0);
  for (const [key, accumulator] of conversations.entries()) {
    accumulator.row.pendingResponses = pendingInRange.get(key) ?? 0;
  }

  const hero: MessageHeroMetric[] = [];
  const totalMessages = totals.inbound + totals.outbound + totals.internal;
  const previousMessages = previousTotal;
  const averagePerDay = totalMessages / rangeDays;

  hero.push({
    key: 'messages-total',
    label: 'Mensagens trocadas',
    value: formatNumber(totalMessages),
    hint: `${formatNumber(averagePerDay)} por dia`,
    trend: formatTrend(totalMessages, previousMessages),
    tone: 'info',
  });

  hero.push({
    key: 'messages-outbound',
    label: 'Respostas enviadas',
    value: formatNumber(totals.outbound),
    hint: `${formatPercent(totalMessages ? totals.outbound / Math.max(1, totalMessages) : 0)} das mensagens`,
    trend: formatTrend(totals.outbound, previousOutbound),
    tone: 'positive',
  });

  const medianResponse = computeMedian(responseDurations);
  hero.push({
    key: 'messages-response-time',
    label: 'Tempo mediano de resposta',
    value: formatDuration(medianResponse),
    hint:
      totals.inbound > 0
        ? `${formatPercent(totals.replies / Math.max(1, totals.inbound))} das mensagens tiveram resposta`
        : 'Sem mensagens recebidas',
    trend: totals.inbound > 0 ? formatTrend(totals.replies, previousReplies) : null,
    tone: medianResponse !== null && medianResponse <= 60 ? 'positive' : 'warning',
  });

  hero.push({
    key: 'messages-conversations',
    label: 'Conversas activas',
    value: formatNumber(Array.from(conversations.values()).filter((item) => item.row.totalMessages > 0).length),
    hint: `${formatNumber(totals.participants.size)} participantes únicos`,
    tone: pendingResponsesTotal > 3 ? 'warning' : 'info',
  });

  const timeline = Array.from(timelineBuckets.values());

  const distribution: MessageDistributionSegment[] = [];
  const distributionTotal = Array.from(distributionCounts.values()).reduce((sum, value) => sum + value, 0);
  if (distributionTotal === 0) {
    distribution.push({ key: 'in-app', label: 'App', value: 0, percentage: 0, tone: 'neutral' });
  } else {
    for (const [key, value] of distributionCounts.entries()) {
      distribution.push({
        key,
        label: CHANNEL_LABEL[key],
        value,
        percentage: value / distributionTotal,
        tone: CHANNEL_TONE[key] ?? 'neutral',
      });
    }
    distribution.sort((a, b) => b.value - a.value);
  }

  const highlights: MessageHighlight[] = [];
  const activeConversations = Array.from(conversations.values()).filter((item) => item.row.totalMessages > 0);
  activeConversations.sort((a, b) => (b.row.lastMessageAt ?? '').localeCompare(a.row.lastMessageAt ?? ''));
  const busiest = [...activeConversations].sort((a, b) => b.row.totalMessages - a.row.totalMessages)[0];
  if (busiest) {
    highlights.push({
      id: `${busiest.row.id}-busiest`,
      title: 'Conversa mais activa',
      description: `${busiest.row.counterpartName} trocou ${formatNumber(
        busiest.row.totalMessages,
      )} mensagens no período.`,
      value: `${formatNumber(busiest.row.totalMessages)} mensagens`,
      tone: 'info',
      meta: busiest.row.lastMessageAt ? `Última mensagem ${formatRelative(busiest.row.lastMessageAt, now)}` : undefined,
    });
  }

  const fastest = [...activeConversations].filter((item) => item.responseCount > 0).sort((a, b) => {
    const aAvg = a.responseSum / a.responseCount;
    const bAvg = b.responseSum / b.responseCount;
    return aAvg - bAvg;
  })[0];
  if (fastest) {
    highlights.push({
      id: `${fastest.row.id}-fast`,
      title: 'Resposta mais rápida',
      description: `${fastest.row.counterpartName} obteve uma resposta média em ${formatDuration(
        fastest.responseSum / fastest.responseCount,
      )}.`,
      value: formatDuration(fastest.responseSum / fastest.responseCount),
      tone: 'positive',
      meta: `${formatNumber(fastest.responseCount)} respostas analisadas`,
    });
  }

  const pendingConversation = activeConversations
    .filter((item) => item.row.pendingResponses > 0)
    .sort((a, b) => b.row.pendingResponses - a.row.pendingResponses)[0];
  if (pendingConversation) {
    highlights.push({
      id: `${pendingConversation.row.id}-pending`,
      title: 'Atenção a pendentes',
      description: `${pendingConversation.row.counterpartName} aguarda ${formatNumber(
        pendingConversation.row.pendingResponses,
      )} resposta(s).`,
      value: `${formatNumber(pendingConversation.row.pendingResponses)} pendentes`,
      tone: 'warning',
      meta: pendingConversation.row.lastMessageAt
        ? `Última há ${formatRelative(pendingConversation.row.lastMessageAt, now)}`
        : undefined,
    });
  }

  const conversationRows: MessageConversationRow[] = activeConversations.map((item) => {
    const { row, channelCounts, responseSum, responseCount } = item;
    let mainChannel: MessageChannelKey = row.mainChannel;
    let maxValue = -1;
    for (const [channelKey, count] of channelCounts.entries()) {
      if (count > maxValue) {
        mainChannel = channelKey;
        maxValue = count;
      }
    }
    return {
      ...row,
      mainChannel,
      mainChannelLabel: CHANNEL_LABEL[mainChannel],
      averageResponseMinutes: responseCount > 0 ? responseSum / responseCount : null,
      pendingResponses: pendingInRange.get(item.row.id) ?? row.pendingResponses ?? 0,
    } satisfies MessageConversationRow;
  });

  conversationRows.sort((a, b) => {
    const lastA = a.lastMessageAt ?? '';
    const lastB = b.lastMessageAt ?? '';
    return lastB.localeCompare(lastA);
  });

  const messagesOrdered = [...messages].sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''));

  return {
    generatedAt: now.toISOString(),
    viewerId,
    range: {
      days: rangeDays,
      since: start.toISOString(),
      until: end.toISOString(),
      label: `${formatDayLabel(start)} – ${formatDayLabel(end)}`,
    },
    totals: {
      inbound: totals.inbound,
      outbound: totals.outbound,
      internal: totals.internal,
      replies: totals.replies,
      participants: totals.participants.size,
      pendingResponses: pendingResponsesTotal,
    },
    hero,
    timeline,
    distribution,
    highlights,
    conversations: conversationRows,
    messages: messagesOrdered,
  } satisfies MessagesDashboardData;
}
