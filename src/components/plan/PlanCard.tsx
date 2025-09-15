'use client';
import React from 'react';

type Props = {
  title: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | string | null;
  description?: string | null;
  updatedAt?: string | null;
  onOpen?: () => void;
};

const statusChip: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-slate-200 text-slate-700',
};

export default function PlanCard({ title, status, description, updatedAt, onOpen }: Props) {
  const chip = status ? statusChip[status] ?? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-700';
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-sm transition bg-white dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {status && <span className={`px-2 py-1 rounded-full text-xs ${chip}`}>{status}</span>}
      </div>
      {description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{description}</p>}
      {updatedAt && (
        <div className="mt-3 text-xs text-slate-500">Atualizado em {new Date(updatedAt).toLocaleDateString()}</div>
      )}
    </button>
  );
}
