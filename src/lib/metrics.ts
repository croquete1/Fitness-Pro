// src/lib/metrics.ts
export type Trend = 'up' | 'down' | 'flat';

export function dirAndPct(
  curr: number,
  prev: number
): { dir: Trend; sign: string; pct: number; delta: number } {
  const delta = curr - prev;
  const dir: Trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const pct = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round((delta / prev) * 100);
  const sign = pct > 0 ? `+${pct}%` : `${pct}%`;
  return { dir, sign, pct, delta };
}
