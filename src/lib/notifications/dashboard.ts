import type {
  NotificationCategoryStat,
  NotificationDashboardMetrics,
  NotificationSnapshot,
  NotificationTimelinePoint,
} from './types';

type TypeMeta = {
  key: string;
  label: string;
  tone: NotificationCategoryStat['tone'];
};

const TYPE_DICTIONARY: Record<string, TypeMeta> = {
  system: { key: 'system', label: 'Sistema', tone: 'neutral' },
  session: { key: 'session', label: 'Sessões', tone: 'primary' },
  reminder: { key: 'reminder', label: 'Lembretes', tone: 'success' },
  billing: { key: 'billing', label: 'Faturação', tone: 'warning' },
  marketing: { key: 'marketing', label: 'Campanhas', tone: 'primary' },
  insight: { key: 'insight', label: 'Insights', tone: 'success' },
  alert: { key: 'alert', label: 'Alertas', tone: 'danger' },
};

function normaliseType(value: string | null | undefined): TypeMeta {
  if (!value) {
    return { key: 'other', label: 'Outros alertas', tone: 'neutral' };
  }
  const key = value.trim().toLowerCase();
  if (!key) {
    return { key: 'other', label: 'Outros alertas', tone: 'neutral' };
  }
  if (TYPE_DICTIONARY[key]) return TYPE_DICTIONARY[key];
  const readable = key
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return { key, label: readable || 'Outros alertas', tone: 'neutral' };
}

function startOfDay(date: Date): Date {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function relativeHourLabel(hour: number): string {
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return '--:--';
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function buildNotificationDashboardMetrics(
  snapshots: NotificationSnapshot[],
  opts: {
    total: number;
    unread: number;
    lastDeliveryAt: string | null;
    supabase: boolean;
    now?: Date;
  },
): NotificationDashboardMetrics {
  const now = opts.now ? new Date(opts.now) : new Date();
  const todayStart = startOfDay(now);
  const timelineStart = startOfDay(new Date(todayStart.getTime() - 13 * 86_400_000));

  const timelinePoints: NotificationTimelinePoint[] = [];
  const timelineMap = new Map<string, NotificationTimelinePoint>();
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(timelineStart.getTime() + i * 86_400_000);
    const key = isoDay(day);
    const point: NotificationTimelinePoint = { date: key, sent: 0, read: 0 };
    timelinePoints.push(point);
    timelineMap.set(key, point);
  }

  const categoriesMap = new Map<string, NotificationCategoryStat>();
  let delivered7d = 0;
  let deliveredPrev7d = 0;
  let read7d = 0;
  const hourBuckets = new Map<number, number>();

  const timelineWindowTotal = { sent: 0 };

  snapshots.forEach((snapshot) => {
    const createdAt = snapshot.created_at ? new Date(snapshot.created_at) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return;

    const dayKey = isoDay(startOfDay(createdAt));
    const diffDays = Math.floor((todayStart.getTime() - startOfDay(createdAt).getTime()) / 86_400_000);

    if (diffDays <= 6 && diffDays >= 0) {
      delivered7d += 1;
      if (snapshot.read) read7d += 1;
    } else if (diffDays >= 7 && diffDays <= 13) {
      deliveredPrev7d += 1;
    }

    const inTimeline = createdAt >= timelineStart && createdAt <= now;
    if (inTimeline) {
      const point = timelineMap.get(dayKey);
      if (point) {
        point.sent += 1;
        timelineWindowTotal.sent += 1;
        if (snapshot.read) point.read += 1;
      }
    }

    const hour = createdAt.getHours();
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);

    if (inTimeline) {
      const typeMeta = normaliseType(snapshot.type);
      const category = categoriesMap.get(typeMeta.key) ?? {
        type: typeMeta.key,
        label: typeMeta.label,
        tone: typeMeta.tone,
        total: 0,
        unread: 0,
        percentage: 0,
        readRate: 0,
      };
      category.total += 1;
      if (!snapshot.read) category.unread += 1;
      categoriesMap.set(typeMeta.key, category);
    }
  });

  const categories = Array.from(categoriesMap.values())
    .map((category) => {
      const readCount = category.total - category.unread;
      return {
        ...category,
        percentage:
          timelineWindowTotal.sent > 0
            ? round((category.total / timelineWindowTotal.sent) * 100, 1)
            : 0,
        readRate: category.total > 0 ? round((readCount / category.total) * 100, 1) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const averagePerDay14d = timelinePoints.length
    ? round(timelinePoints.reduce((acc, point) => acc + point.sent, 0) / timelinePoints.length, 1)
    : 0;

  let busiestHourLabel: string | null = null;
  if (hourBuckets.size > 0) {
    let maxHour = 0;
    let maxCount = -1;
    hourBuckets.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });
    busiestHourLabel = relativeHourLabel(maxHour);
  }

  const delivered7dDelta = deliveredPrev7d === 0 ? (delivered7d === 0 ? 0 : delivered7d) : delivered7d - deliveredPrev7d;

  const readRate7d = delivered7d > 0 ? round((read7d / delivered7d) * 100, 1) : 0;

  return {
    supabase: opts.supabase,
    total: opts.total,
    unread: opts.unread,
    delivered7d,
    delivered7dDelta,
    readRate7d,
    averagePerDay14d,
    lastDeliveryAt: opts.lastDeliveryAt,
    busiestHourLabel,
    timeline: timelinePoints,
    categories,
  };
}

export function describeType(type: string | null | undefined): TypeMeta {
  return normaliseType(type);
}
