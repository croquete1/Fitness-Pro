// src/components/ui/EmptyState.tsx
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { UrlObject } from 'url';

type Href = string | Route | UrlObject;

type Props = {
  /** podes usar icon="📉" ou emoji="📉" — ambos funcionam */
  icon?: string;
  emoji?: string;
  title: string;
  subtitle?: string;
  actionHref?: Href;
  actionLabel?: string;
};

export default function EmptyState({
  icon,
  emoji,
  title,
  subtitle,
  actionHref,
  actionLabel,
}: Props) {
  const resolvedIcon = icon ?? emoji ?? '🔎';

  const href =
    typeof actionHref === 'string'
      ? (actionHref as Route)
      : (actionHref as UrlObject | undefined);

  return (
    <div style={{ padding: 16, textAlign: 'center', display: 'grid', gap: 8 }}>
      <div style={{ fontSize: 28 }} aria-hidden>
        {resolvedIcon}
      </div>
      <div style={{ fontWeight: 800 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</div>}
      {href && actionLabel && (
        <Link className="btn chip" href={href}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
