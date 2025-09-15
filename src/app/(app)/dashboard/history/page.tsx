'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';


type AnthroRow = {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  bodyfat_pct: number | null;
};

function MiniLine({ points }: { points: number[] }) {
  const w = 320, h = 80, pad = 8;
  const vals = points.filter((v) => typeof v === 'number');
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1;
  const span = Math.max(1e-6, max - min);
  const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
  const d = points
    .map((v, i) => {
      const x = pad + stepX * i;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="block">
      <rect x={0} y={0} width={w} height={h} rx={10} className="fill-slate-50 dark:fill-slate-800" />
      <path d={d} className="stroke-sky-500 dark:stroke-sky-400 fill-none" strokeWidth={2} />
    </svg>
  );
}

export default function HistoryPage() {
  const sb = supabaseBrowser ();
  const [list, setList] = useState<AnthroRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: user } = await sb.auth.getUser();
      const uid = user.user?.id;
      if (!uid) return;
      const { data } = await sb
        .from('anthropometry')
        .select('id,measured_at,weight_kg,bodyfat_pct')
        .eq('user_id', uid)
        .order('measured_at', { ascending: true });
      setList((data ?? []) as unknown as AnthroRow[]);
    })();
  }, [sb]);

  const weights = list.map((r) => Number(r.weight_kg ?? NaN)).filter((n) => !Number.isNaN(n));
  const last = weights.at(-1) ?? null;
  const first = weights.at(0) ?? null;
  const delta = last !== null && first !== null ? +(last - first).toFixed(1) : null;

  return (
    <main className="p-4 md:p-6 space-y-6">
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5">
        <h2 className="font-bold text-lg">Histórico de desempenho</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Evolução do peso e % de gordura corporal ao longo do tempo.
        </p>

        <div className="grid md:grid-cols-[1fr,320px] gap-4 mt-3">
          <div className="grid gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-sm opacity-70 mb-2">Peso (kg)</div>
              <MiniLine points={weights} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                <div className="text-xs opacity-70">Registos</div>
                <div className="font-semibold text-lg">{list.length}</div>
              </div>
              <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 p-3">
                <div className="text-xs opacity-70">Peso atual</div>
                <div className="font-semibold text-lg">{last ?? '—'} kg</div>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                <div className="text-xs opacity-70">Δ desde início</div>
                <div className="font-semibold text-lg">{delta !== null ? `${delta > 0 ? '+' : ''}${delta} kg` : '—'}</div>
              </div>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 p-3">
                <div className="text-xs opacity-70">% BF (últ.)</div>
                <div className="font-semibold text-lg">{list.at(-1)?.bodyfat_pct ?? '—'}%</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Timeline</h3>
            <div className="grid gap-2">
              {list.length === 0 && <div className="text-sm opacity-70">Ainda sem registos.</div>}
              {list
                .slice()
                .reverse()
                .map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="text-xs opacity-70">{new Date(r.measured_at).toLocaleString()}</div>
                    <div className="text-sm">
                      Peso <b>{r.weight_kg ?? '—'} kg</b> · BF <b>{r.bodyfat_pct ?? '—'}%</b>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
