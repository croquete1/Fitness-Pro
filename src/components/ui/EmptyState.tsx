'use client';

import Link from 'next/link';

export default function EmptyState({
  emoji = '🔎',
  title,
  description,
  actionHref,
  actionLabel,
}: {
  emoji?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="grid place-items-center gap-2 p-6 text-center">
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </div>
      {description && (
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          {description}
        </div>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn chip" style={{ marginTop: 6 }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
