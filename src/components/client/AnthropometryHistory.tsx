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
  const [showBigChart, setShowBigChart] = useState(false);

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

  const trendWeight = useMemo(
    () => items.slice().reverse().map(r => ({ x: r.date, y: r.weight_kg ?? null })),
    [items]
  );
  const trendWaist  = useMemo(
    () => items.slice().reverse().map(r => ({ x: r.date, y: r.waist_cm ?? null })),
    [items]
  );

  function exportCSV() {
    const headers = [
      'date','height_cm','weight_kg','body_fat_pct','chest_cm','waist_cm','hip_cm',
      'thigh_cm','arm_cm','calf_cm','shoulders_cm','neck_cm','notes'
    ];
    const lines = [
      headers.join(','),
      ...items
        .slice() // já vem desc por data
        .reverse() // export cronológico
        .map(r => [
          safe(r.date),
          num(r.height_cm), num(r.weight_kg), num(r.body_fat_pct),
          num(r.chest_cm), num(r.waist_cm), num(r.hip_cm),
          num(r.thigh_cm), num(r.arm_cm), num(r.calf_cm),
          num(r.shoulders_cm), num(r.neck_cm),
          csvEscape(r.notes ?? '')
        ].join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `anthropometry_${clientId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0 }}>Histórico antropométrico</h3>
        <div className="flex items-center gap-8">
          <Sparkline title="Peso (kg)" data={trendWeight} width={160} height={40} goodWhen="down" />
          <Sparkline title="Cintura (cm)" data={trendWaist} width={160} height={40} goodWhen="down" />
          <div className="flex items-center gap-6">
            <button className="btn" onClick={() => setShowBigChart(s => !s)}>
              {showBigChart ? 'Ocultar gráfico' : 'Ver gráfico'}
            </button>
            <button className="btn" onClick={exportCSV}>Exportar CSV</button>
          </div>
        </div>
      </div>

      {showBigChart && (
        <BigChart
          series={[
            { name: 'Peso (kg)',  data: trendWeight, color: 'var(--danger)', goodWhen: 'down' },
            { name: 'Cintura (cm)', data: trendWaist,  color: 'var(--danger)', goodWhen: 'down' },
          ]}
          height={220}
        />
      )}

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
                const prev = items[i + 1]; // a lista está desc
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

/* ---------- utils ---------- */

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('pt-PT'); } catch { return d; }
}
function val(v: number | null | undefined) {
  return (v ?? null) === null ? '—' : Number(v).toLocaleString('pt-PT');
}
function num(v: number | null | undefined) {
  return (v ?? null) === null ? '' : String(v);
}
function safe(s: any) {
  return String(s ?? '').replaceAll('\n', ' ').trim();
}
function csvEscape(s: string) {
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
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
  const bg = good ? 'rgba(22,163,74,.08)' : 'rgba(239,68,68,.08)';

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

/* Gráfico grande multi-série (peso e cintura) */
function BigChart({
  series,
  height = 220,
}: {
  series: { name: string; data: { x: string; y: number | null }[]; color: string; goodWhen: 'up' | 'down' }[];
  height?: number;
}) {
  const width = 680;
  const pad = 24;

  const all = series.flatMap(s => s.data.map(d => d.y).filter((v): v is number => v != null));
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const n = Math.max(...series.map(s => s.data.length));
  const stepX = (width - pad * 2) / Math.max(1, n - 1);

  function pathFor(data: { x: string; y: number | null }[]) {
    return data.map((d, i) => {
      const x = pad + i * stepX;
      const ratio = (d.y == null || max === min) ? 0.5 : (d.y - min) / (max - min);
      const y = height - pad - ratio * (height - pad * 2);
      return `${x},${y}`;
    }).join(' ');
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-70">Evolução (peso e cintura)</div>
        <div className="flex gap-3 text-xs">
          {series.map(s => (
            <span key={s.name} className="flex items-center gap-1">
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* grelha simples */}
        {[0,0.25,0.5,0.75,1].map((t,i)=>(
          <line key={i}
            x1={pad} x2={width-pad}
            y1={pad + (height-pad*2)*t} y2={pad + (height-pad*2)*t}
            stroke="currentColor" opacity="0.12" />
        ))}
        {series.map(s => (
          <polyline key={s.name}
            points={pathFor(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            opacity="0.9"
          />
        ))}
      </svg>
    </div>
  );
}
