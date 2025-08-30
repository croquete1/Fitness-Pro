import Link from 'next/link';

export default function EmptyState({
  emoji, title, subtitle, actionHref, actionLabel,
}: { emoji: string; title: string; subtitle?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div style={{
      display: 'grid', justifyItems: 'center', gap: 6, padding: 24,
      border: '1px dashed var(--border)', borderRadius: 14, color: 'var(--muted)',
      background: 'color-mix(in srgb, var(--chip-bg) 60%, transparent)'
    }}>
      <div style={{ fontSize: 28 }} aria-hidden>{emoji}</div>
      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12 }}>{subtitle}</div>}
      {actionHref && actionLabel && (
        <Link className="btn chip" href={actionHref}>{actionLabel}</Link>
      )}
    </div>
  );
}
