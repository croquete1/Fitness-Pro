// src/components/client/AnthropometryHistory.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = {
  id: string;
  client_id: string;
  created_by_id: string | null;
  date: string; // ISO date
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  calf_cm: number | null;
  shoulders_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Props = { clientId: string };

export default function AnthropometryHistory({ clientId }: Props) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anthropometry/${encodeURIComponent(clientId)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Erro a carregar histórico');
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [clientId]);

  const trendWeight = useMemo(() => items.slice().reverse().map(r => ({ x: r.date, y: r.weight_kg ?? null })), [items]);
  const trendWaist  = useMemo(() => items.slice().reverse().map(r => ({ x: r.date, y: r.waist_cm ?? null })), [items]);

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0 }}>Histórico antropométrico</h3>
        <div className="flex items-center gap-8">
          <Sparkline title="Peso (kg)" data={trendWeight} width={160} height={40} goodWhen="down" />
          <Sparkline title="Cintura (cm)" data={trendWaist} width={160} height={40} goodWhen="down" />
        </div>
      </div>

      {loading ? (
        <div className="text-sm opacity-70">A carregar…</div>
      ) : items.length === 0 ? (
        <div className="text-sm opacity-70">Sem avaliações registadas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="text-left text-xs opacity-70">
                <th className="p-2">Data</th>
                <th className="p-2">Peso</th>
                <th className="p-2">Cintura</th>
                <th className="p-2">Gordura %</th>
                <th className="p-2">Peito</th>
                <th className="p-2">Anca</th>
                <th className="p-2">Coxa</th>
                <th className="p-2">Braço</th>
                <th className="p-2">Pant.</th>
                <th className="p-2">Ombros</th>
                <th className="p-2">Pescoço</th>
                <th className="p-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => {
                const prev = items[i + 1]; // a lista está desc por data
                return (
                  <tr key={r.id} className="text-sm hover:bg-[var(--hover)]">
                    <td className="p-2 whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="p-2">{val(r.weight_kg)} <Delta now={r.weight_kg} prev={prev?.weight_kg} goodWhen="down" unit="kg" /></td>
                    <td className="p-2">{val(r.waist_cm)} <Delta now={r.waist_cm} prev={prev?.waist_cm} goodWhen="down" unit="cm" /></td>
                    <td className="p-2">{val(r.body_fat_pct)} <Delta now={r.body_fat_pct} prev={prev?.body_fat_pct} goodWhen="down" unit="%" /></td>
                    <td className="p-2">{val(r.chest_cm)} <Delta now={r.chest_cm} prev={prev?.chest_cm} goodWhen="up" unit="cm" /></td>
                    <td className="p-2">{val(r.hip_cm)} <Delta now={r.hip_cm} prev={prev?.hip_cm} goodWhen="down" unit="cm" /></td>
                    <td className="p-2">{val(r.thigh_cm)} <Delta now={r.thigh_cm} prev={prev?.thigh_cm} goodWhen="up" unit="cm" /></td>
                    <td className="p-2">{val(r.arm_cm)} <Delta now={r.arm_cm} prev={prev?.arm_cm} goodWhen="up" unit="cm" /></td>
                    <td className="p-2">{val(r.calf_cm)} <Delta now={r.calf_cm} prev={prev?.calf_cm} goodWhen="up" unit="cm" /></td>
                    <td className="p-2">{val(r.shoulders_cm)} <Delta now={r.shoulders_cm} prev={prev?.shoulders_cm} goodWhen="up" unit="cm" /></td>
                    <td className="p-2">{val(r.neck_cm)} <Delta now={r.neck_cm} prev={prev?.neck_cm} goodWhen="down" unit="cm" /></td>
                    <td className="p-2">{r.notes ?? ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('pt-PT'); } catch { return d; }
}
function val(v: number | null | undefined) {
  return (v ?? null) === null ? '—' : Number(v).toLocaleString('pt-PT');
}

function Delta({
  now, prev, goodWhen, unit,
}: { now: number | null | undefined; prev: number | null | undefined; goodWhen: 'up' | 'down'; unit: string }) {
  if (now == null || prev == null) return null;
  const diff = Number(now) - Number(prev);
  if (!Number.isFinite(diff) || diff === 0) return null;

  const up = diff > 0;
  const good = (up && goodWhen === 'up') || (!up && goodWhen === 'down');
  const color = good ? 'var(--ok)' : 'var(--danger)';
  const bg = good ? 'rgba(0,128,0,.08)' : 'rgba(200,0,0,.08)';

  return (
    <span
      className="ml-1 px-1.5 py-0.5 rounded-md text-[11px]"
      style={{ color, background: bg, border: `1px solid ${color}33` }}
      aria-label={up ? 'Aumentou' : 'Diminuiu'}
      title={up ? 'Aumentou' : 'Diminuiu'}
    >
      {up ? '↑' : '↓'} {Math.abs(diff).toLocaleString('pt-PT', { maximumFractionDigits: 2 })} {unit}
    </span>
  );
}

function Sparkline({
  title, data, width = 160, height = 40, goodWhen,
}: { title: string; data: { x: string; y: number | null }[]; width?: number; height?: number; goodWhen: 'up' | 'down' }) {
  const points = useMemo(() => {
    const vals = data.map(d => d.y).filter((v): v is number => v != null);
    if (vals.length < 2) return '';
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = 2;
    const stepX = (width - pad * 2) / (data.length - 1 || 1);
    return data.map((d, i) => {
      const x = pad + i * stepX;
      const ratio = (d.y == null || max === min) ? 0.5 : (d.y - min) / (max - min);
      const y = height - pad - ratio * (height - pad * 2);
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  const color = goodWhen === 'down' ? 'var(--danger)' : 'var(--ok)';

  return (
    <div className="grid gap-1" style={{ minWidth: width }}>
      <div className="text-xs opacity-70">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={title}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
      </svg>
    </div>
  );
}
