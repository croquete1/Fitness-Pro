// src/app/(app)/dashboard/admin/exercises/ExerciseCatalogClient.tsx
'use client';

import { useMemo, useState, useCallback } from 'react';

type ExerciseRow = {
  id: string;
  name: string;
  muscle_group?: string | null;
  level?: string | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function ExerciseCatalogClient({ initial }: { initial: ExerciseRow[] }) {
  const [rows, setRows] = useState<ExerciseRow[]>(() =>
    (initial ?? []).map((r) => ({
      ...r,
      is_published: (r as any).is_published ?? (r as any).published ?? false,
    })),
  );
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.name ?? '').toLowerCase().includes(s) ||
      (r.muscle_group ?? '').toLowerCase().includes(s) ||
      (r.level ?? '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const togglePublish = useCallback(async (id: string, publish: boolean) => {
    // otimista
    setRows(prev => prev.map(r => r.id === id ? { ...r, is_published: publish } : r));
    try {
      const res = await fetch(`/api/admin/exercises/${encodeURIComponent(id)}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      });
      if (!res.ok) throw new Error(await res.text());
      okToast(publish ? 'Exercício publicado.' : 'Exercício retirado.');
    } catch (e) {
      // reverter
      setRows(prev => prev.map(r => r.id === id ? { ...r, is_published: !publish } : r));
      errToast('Falhou atualizar o estado do exercício.');
    }
  }, []);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Pesquisar por nome, grupo muscular, nível…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={inputStyle}
          aria-label="Pesquisar exercícios"
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ opacity: .6 }}>Sem exercícios a mostrar.</div>
      ) : (
        <ul style={listStyle}>
          {filtered.map((r) => (
            <li key={r.id} style={itemStyle}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <Badge published={!!r.is_published} />
                </div>
                <div style={{ fontSize: 12, opacity: .7 }}>
                  {r.muscle_group ?? '—'} • {r.level ?? '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {r.is_published ? (
                  <button className="btn chip" onClick={() => togglePublish(r.id, false)}>Retirar</button>
                ) : (
                  <button className="btn primary" onClick={() => togglePublish(r.id, true)}>Publicar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ published }: { published: boolean }) {
  return (
    <span
      className="chip"
      style={{
        fontWeight: 700,
        color: published ? '#065f46' : '#991b1b',
        background: published ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.10)',
        border: `1px solid ${published ? '#10b98122' : '#ef444422'}`,
      }}
    >
      {published ? 'PUBLICADO' : 'RASCUNHO'}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--border, #e5e7eb)',
  background: 'var(--card, #fff)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  minWidth: 260,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: 10,
};

const itemStyle: React.CSSProperties = {
  padding: 12,
  display: 'grid',
  gap: 10,
  borderRadius: 12,
  border: '1px solid var(--border, #e5e7eb)',
  background: 'var(--card, #fff)',
};

/* toasts simples sem dependências */
function okToast(msg: string)  { makeToast(msg, 'ok'); }
function errToast(msg: string) { makeToast(msg, 'error'); }
function makeToast(msg: string, kind: 'ok' | 'error') {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', left: '50%', transform: 'translateX(-50%)',
    bottom: '16px', padding: '10px 14px', borderRadius: '10px',
    color: kind === 'ok' ? '#065f46' : '#991b1b',
    background: kind === 'ok' ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
    border: `1px solid ${kind === 'ok' ? '#10b98122' : '#ef444422'}`,
    zIndex: 9999, fontSize: '14px', backdropFilter: 'saturate(180%) blur(6px)',
  } as React.CSSProperties);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}