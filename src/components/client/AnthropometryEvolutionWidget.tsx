'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = {
  id: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
};

export default function AnthropometryEvolutionWidget({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anthropometry/${encodeURIComponent(clientId)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Erro');
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [clientId]);

  const first = useMemo(() => items.length ? items[items.length - 1] : null, [items]);
  const last  = useMemo(() => items.length ? items[0] : null, [items]);

  function delta(now: number | null | undefined, prev: number | null | undefined) {
    if (now == null || prev == null) return null;
    const d = Number(now) - Number(prev);
    if (!Number.isFinite(d) || d === 0) return 0;
    return d;
  }

  const dWeight = delta(last?.weight_kg, first?.weight_kg);
  const dWaist  = delta(last?.waist_cm,  first?.waist_cm);
  const dFat    = delta(last?.body_fat_pct, first?.body_fat_pct);
  const dChest  = delta(last?.chest_cm, first?.chest_cm);
  const dArm    = delta(last?.arm_cm, first?.arm_cm);

  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0 }}>Evolução desde a 1ª avaliação</h3>
        {!loading && first && last && (
          <div className="text-xs opacity-70">
            {new Date(first.date).toLocaleDateString('pt-PT')} → {new Date(last.date).toLocaleDateString('pt-PT')}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-sm opacity-70">A carregar…</div>
      ) : !first || !last ? (
        <div className="text-sm opacity-70">Sem dados suficientes.</div>
      ) : (
        <div className="grid md:grid-cols-5 gap-8 mt-2">
          <MetricDelta title="Peso"  delta={dWeight} unit="kg" goodWhen="down" />
          <MetricDelta title="Cintura" delta={dWaist}  unit="cm" goodWhen="down" />
          <MetricDelta title="Gordura" delta={dFat}    unit="%"  goodWhen="down" />
          <MetricDelta title="Peito"   delta={dChest}  unit="cm" goodWhen="up" />
          <MetricDelta title="Braço"   delta={dArm}    unit="cm" goodWhen="up" />
        </div>
      )}
    </div>
  );
}

function MetricDelta({
  title, delta, unit, goodWhen,
}: { title: string; delta: number | null; unit: string; goodWhen: 'up' | 'down' }) {
  const zero = delta === 0 || delta === null;
  const up   = (delta ?? 0) > 0;
  const good = !zero && ((up && goodWhen === 'up') || (!up && goodWhen === 'down'));
  const color = good ? 'var(--ok)' : up ? 'var(--danger)' : 'var(--ok)';
  const bg    = good
    ? 'rgba(22,163,74,.08)'
    : up ? 'rgba(239,68,68,.08)' : 'rgba(22,163,74,.08)';

  return (
    <div className="grid gap-1">
      <div className="text-xs opacity-70">{title}</div>
      <div>
        {delta === null ? '—' : (
          <span className="px-2 py-1 rounded-md text-sm" style={{ color, background: bg, border: `1px solid ${color}33` }}>
            {delta > 0 ? '↑' : delta < 0 ? '↓' : '•'} {Math.abs(delta).toLocaleString('pt-PT', { maximumFractionDigits: 2 })} {unit}
          </span>
        )}
      </div>
    </div>
  );
}
