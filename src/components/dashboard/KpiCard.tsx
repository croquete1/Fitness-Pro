'use client';

import React from 'react';

type Variant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal';

type Props = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: Variant;
  footer?: React.ReactNode;
  right?: React.ReactNode; // compat anterior
};

export default function KpiCard({
  label,
  value,
  loading,
  icon,
  variant = 'blue',
  footer,
  right,
}: Props) {
  return (
    <div className={`kpi-card kpi--${variant}`} role="status" aria-busy={loading ? 'true' : 'false'}>
      <div className="kpi-row">
        <div className="kpi-left">
          <div className="kpi-icon" aria-hidden>{icon ?? '📈'}</div>
          <div className="kpi-main">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{loading ? <span className="spinner" /> : value}</div>
          </div>
        </div>
        {right && <div className="kpi-right">{right}</div>}
      </div>
      {footer && <div className="kpi-footer">{footer}</div>}

      <style jsx>{`
        .kpi-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: var(--shadow-1);
          padding: 12px;
        }
        .kpi-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
        .kpi-left { display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: center; }
        .kpi-icon {
          width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
          background: var(--kpi-bg); color: var(--kpi-fg); font-size: 18px;
        }
        .kpi-label { font-size: 12px; color: var(--muted-fg); text-transform: uppercase; letter-spacing: .02em; }
        .kpi-value { font-size: 22px; font-weight: 800; line-height: 1.1; }
        .kpi-footer {
          margin-top: 8px; font-size: 12px; color: var(--muted-fg);
          border-top: 1px dashed var(--border); padding-top: 6px;
        }

        /* Variantes */
        .kpi--blue   { --kpi-bg: color-mix(in srgb, var(--primary) 18%, transparent); --kpi-fg: var(--primary-600); }
        .kpi--green  { --kpi-bg: color-mix(in srgb, var(--success) 18%, transparent); --kpi-fg: var(--success); }
        .kpi--amber  { --kpi-bg: color-mix(in srgb, var(--warning) 18%, transparent); --kpi-fg: var(--warning); }
        .kpi--red    { --kpi-bg: color-mix(in srgb, var(--danger) 18%, transparent);  --kpi-fg: var(--danger); }
        .kpi--purple { --kpi-bg: color-mix(in srgb, var(--accent) 18%, transparent);  --kpi-fg: var(--accent); }
        .kpi--teal   { --kpi-bg: color-mix(in srgb, var(--accent-2) 18%, transparent);--kpi-fg: var(--accent-2); }
      `}</style>
    </div>
  );
}
