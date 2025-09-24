'use client';
import * as React from 'react';
import MiniSpark from '@/components/charts/MiniSpark';

type Props = {
  title: string;
  value: string | number;
  delta?: number; // positivo/negativo = seta ↑/↓
  loading?: boolean;
  sparkData?: number[];
};

export default function KpiCard({ title, value, delta, loading, sparkData }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
        <div className="h-3 w-24 mb-3 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
        <div className="h-8 w-32 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
        <div className="mt-3 h-9 rounded bg-black/5 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  const isUp = typeof delta === 'number' ? delta >= 0 : undefined;

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
      <div className="text-xs font-semibold opacity-60">{title}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {typeof delta === 'number' && (
          <div
            className={`text-xs font-medium ${
              isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
            aria-label={isUp ? 'A subir' : 'A descer'}
            title={isUp ? 'A subir' : 'A descer'}
          >
            {isUp ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 text-neutral-400">
          <MiniSpark data={sparkData} className="w-full h-9" />
        </div>
      )}
    </div>
  );
}
