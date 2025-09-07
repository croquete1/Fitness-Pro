// src/components/dashboard/KpiCard.tsx
'use client';

import * as React from 'react';

type Props = {
  label: string;
  value: React.ReactNode;
  footer?: React.ReactNode;
  right?: React.ReactNode;
  /** Novo: ícone grande ou emoji à esquerda do título/valor */
  icon?: React.ReactNode;
  /** Novo: mostra estado de carregamento (skeleton) */
  loading?: boolean;
};

export default function KpiCard({ label, value, footer, right, icon, loading }: Props) {
  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && (
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--sidebar-active)',
                border: '1px solid var(--border)',
                fontSize: 18,
              }}
            >
              {icon}
            </div>
          )}
          <div className="text-muted small">{label}</div>
        </div>
        {right ? <div>{right}</div> : null}
      </div>

      <div style={{ fontSize: 28, fontWeight: 900, minHeight: 34, lineHeight: 1.15 }}>
        {loading ? (
          <span
            aria-busy="true"
            style={{
              display: 'inline-block',
              height: 20,
              minWidth: 80,
              borderRadius: 6,
              background:
                'linear-gradient(90deg, var(--hover) 25%, var(--border) 37%, var(--hover) 63%)',
              backgroundSize: '400% 100%',
              animation: 'kpi-skel 1.2s ease-in-out infinite',
            }}
          />
        ) : (
          value
        )}
      </div>

      {footer ? <div className="text-muted small">{footer}</div> : null}

      <style jsx>{`
        @keyframes kpi-skel {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  );
}
