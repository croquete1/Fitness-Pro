'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { NavigationQuickMetric } from '@/lib/navigation/types';

export type SidebarQuickMetricsProps = {
  metrics?: NavigationQuickMetric[] | null;
  maxVisible?: number;
  onNavigate?: () => void;
};

export default function SidebarQuickMetrics({ metrics, maxVisible, onNavigate }: SidebarQuickMetricsProps) {
  if (!metrics || metrics.length === 0) return null;

  const visibleMetrics = typeof maxVisible === 'number' ? metrics.slice(0, maxVisible) : metrics;
  if (visibleMetrics.length === 0) return null;

  return (
    <div className="neo-sidebar__quick" aria-live="polite">
      {visibleMetrics.map((metric) => {
        const tone = metric.tone ?? 'neutral';
        const className = clsx(
          'neo-sidebar__quick-card',
          `neo-sidebar__quick-card--${tone}`,
          metric.href && 'neo-sidebar__quick-card--link',
        );
        const deltaTone = metric.delta != null && metric.delta < 0 ? 'negative' : undefined;

        if (metric.href) {
          return (
            <Link
              key={metric.id}
              href={metric.href}
              prefetch={false}
              className={className}
              onClick={onNavigate}
            >
              <span className="neo-sidebar__quick-label">{metric.label}</span>
              <span className="neo-sidebar__quick-value">{metric.value}</span>
              {metric.hint && <span className="neo-sidebar__quick-hint">{metric.hint}</span>}
              {metric.deltaLabel && (
                <span
                  className="neo-sidebar__quick-delta"
                  data-tone={deltaTone}
                  aria-live="off"
                >
                  {metric.deltaLabel}
                </span>
              )}
            </Link>
          );
        }

        return (
          <div key={metric.id} className={className} role="status">
            <span className="neo-sidebar__quick-label">{metric.label}</span>
            <span className="neo-sidebar__quick-value">{metric.value}</span>
            {metric.hint && <span className="neo-sidebar__quick-hint">{metric.hint}</span>}
            {metric.deltaLabel && (
              <span className="neo-sidebar__quick-delta" data-tone={deltaTone} aria-live="off">
                {metric.deltaLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
