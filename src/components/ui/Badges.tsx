// src/components/ui/Badges.tsx
'use client';

export function DeltaBadge({
  now,
  prev,
  unit,
  goodWhen,
  maxDigits = 2,
}: {
  now?: number | null;
  prev?: number | null;
  unit?: string;
  goodWhen: 'up' | 'down';
  maxDigits?: number;
}) {
  if (now == null || prev == null) return null;
  const diff = Number(now) - Number(prev);
  if (!Number.isFinite(diff) || diff === 0) return null;

  const up = diff > 0;
  const good = (up && goodWhen === 'up') || (!up && goodWhen === 'down');
  const color = good ? 'var(--ok)' : 'var(--danger)';
  const bg = good ? 'rgba(22,163,74,.08)' : 'rgba(239,68,68,.08)';

  return (
    <span
      className="ml-1 px-1.5 py-0.5 rounded-md text-[11px]"
      style={{ color, background: bg, border: `1px solid ${color}33` }}
      title={up ? 'Aumentou' : 'Diminuiu'}
    >
      {up ? '↑' : '↓'} {Math.abs(diff).toLocaleString('pt-PT', { maximumFractionDigits: maxDigits })}{' '}
      {unit ?? ''}
    </span>
  );
}

export function ProgressBadge({
  done,
  total,
  compact = false,
}: {
  done: number;
  total: number;
  compact?: boolean;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div
      className="inline-flex items-center gap-2 px-2 py-1 rounded-md border"
      style={{ borderColor: 'var(--border)', background: 'var(--btn-bg)' }}
      title={`${done}/${total} (${pct}%)`}
    >
      <div className="w-16 h-1.5 rounded overflow-hidden" style={{ background: 'var(--hover)' }}>
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: 'var(--ok)' }}
        />
      </div>
      {compact ? (
        <span className="text-[11px] opacity-80">{pct}%</span>
      ) : (
        <span className="text-[11px] opacity-80">
          {done}/{total} ({pct}%)
        </span>
      )}
    </div>
  );
}