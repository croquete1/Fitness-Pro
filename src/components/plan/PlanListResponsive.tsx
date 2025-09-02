'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PlanRow } from '@/types/plan';

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleString('pt-PT');
  } catch {
    return d ?? '—';
  }
}

function timeAgo(d?: string | null) {
  if (!d) return '—';
  const now = Date.now();
  const t = new Date(d).getTime();
  const diff = Math.max(0, now - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mês`;
  const yr = Math.floor(mon / 12);
  return `${yr}a`;
}

function StatusChip({ status }: { status?: string | null }) {
  const s = (status ?? 'ACTIVE').toUpperCase();
  const color =
    s === 'ACTIVE'
      ? 'var(--ok)'
      : s === 'PENDING'
      ? 'var(--warn, #f59e0b)'
      : 'var(--danger)';
  const bg =
    s === 'ACTIVE'
      ? 'rgba(22,163,74,.08)'
      : s === 'PENDING'
      ? 'rgba(245,158,11,.08)'
      : 'rgba(239,68,68,.08)';
  return (
    <span
      className="chip"
      style={{
        borderColor: `${color}33`,
        color,
        background: bg,
        fontWeight: 600,
      }}
    >
      {s}
    </span>
  );
}

/** Tooltip/Popover acessível (tap/tecla/hover) */
function InfoPopover({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label="Mais detalhes"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="btn chip"
        style={{
          lineHeight: 1,
          padding: '4px 8px',
          fontSize: 12,
        }}
      >
        ℹ️
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 240,
            padding: 10,
            boxShadow: '0 10px 28px rgba(0,0,0,.18)',
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 13 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

export default function PlanListResponsive({ rows }: { rows: PlanRow[] }) {
  // prepara dados para tabela (desktop)
  const table = useMemo(
    () =>
      rows.map((p) => ({
        id: p.id,
        title: p.title ?? `Plano #${p.id.slice(0, 8)}`,
        status: p.status ?? 'ACTIVE',
        updatedAbs: fmtDate(p.updated_at),
        updatedRel: timeAgo(p.updated_at),
        trainer: p.trainer_id?.slice(0, 8) ?? '—',
        client: p.client_id?.slice(0, 8) ?? '—',
      })),
    [rows]
  );

  if (!rows.length) {
    return (
      <div className="text-muted" style={{ padding: 8 }}>
        Sem planos ainda.
      </div>
    );
  }

  return (
    <>
      {/* Cards (mobile-first) */}
      <ul className="show-sm" style={{ display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
        {table.map((p) => (
          <li key={p.id} className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <StatusChip status={p.status} />
            </div>

            <div className="text-xs opacity-70">
              Atualizado: <strong>{p.updatedRel}</strong> <span style={{ opacity: 0.65 }}>({p.updatedAbs})</span>
            </div>

            <div className="text-xs opacity-70" style={{ display: 'flex', gap: 12 }}>
              <span>PT: <code>{p.trainer}</code></span>
              <span>Cliente: <code>{p.client}</code></span>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
              <InfoPopover title="Detalhes do plano">
                <div className="grid" style={{ display: 'grid', gap: 6 }}>
                  <div><strong>Status:</strong> {p.status}</div>
                  <div><strong>Atualizado:</strong> {p.updatedAbs} ({p.updatedRel})</div>
                  <div><strong>Trainer ID:</strong> <code>{p.trainer}</code></div>
                  <div><strong>Cliente ID:</strong> <code>{p.client}</code></div>
                </div>
              </InfoPopover>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">
                  Editar
                </Link>
                <Link href={`/dashboard/pt/plans/${p.id}`} className="btn chip" prefetch>
                  Abrir
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Tabela (desktop) */}
      <div className="hide-sm">
        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>IDs</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {table.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 8, fontWeight: 600 }}>{p.title}</td>
                <td style={{ padding: 8 }}><StatusChip status={p.status} /></td>
                <td style={{ padding: 8 }}>
                  {p.updatedAbs}{' '}
                  <span className="text-xs opacity-70">({p.updatedRel})</span>
                </td>
                <td style={{ padding: 8 }}>
                  <span className="text-xs opacity-70">PT:</span> <code>{p.trainer}</code>{' '}
                  <span className="text-xs opacity-70" style={{ marginLeft: 8 }}>Cliente:</span> <code>{p.client}</code>
                </td>
                <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <InfoPopover title="Detalhes do plano">
                    <div className="grid" style={{ display: 'grid', gap: 6 }}>
                      <div><strong>Status:</strong> {p.status}</div>
                      <div><strong>Atualizado:</strong> {p.updatedAbs} ({p.updatedRel})</div>
                      <div><strong>Trainer ID:</strong> <code>{p.trainer}</code></div>
                      <div><strong>Cliente ID:</strong> <code>{p.client}</code></div>
                    </div>
                  </InfoPopover>
                  <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip" style={{ marginLeft: 8 }}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* util classes para mobile/desktop */}
      <style jsx>{`
        .show-sm { display: none; }
        .hide-sm { display: block; }
        @media (max-width: 768px) {
          .show-sm { display: grid; }
          .hide-sm { display: none !important; }
        }
      `}</style>
    </>
  );
}