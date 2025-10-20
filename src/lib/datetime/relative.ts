const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

const BUCKETS: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
  { limit: 60_000, unit: 'second', size: 1_000 },
  { limit: 3_600_000, unit: 'minute', size: 60_000 },
  { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
  { limit: 604_800_000, unit: 'day', size: 86_400_000 },
  { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
  { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
  { limit: Infinity, unit: 'year', size: 31_556_952_000 },
];

export function formatRelativeTime(value: string | Date | null | undefined, now: Date = new Date()): string | null {
  if (!value) return null;
  const target = typeof value === 'string' ? new Date(value) : value;
  if (!(target instanceof Date) || Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const bucket = BUCKETS.find((item) => abs < item.limit) ?? BUCKETS[BUCKETS.length - 1]!;
  const valueRounded = Math.round(diff / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}
