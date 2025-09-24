// src/components/dashboard/PTAgendaCard.tsx
'use client';
import * as React from 'react';

export type PTSess = {
  id: string;
  title: string;
  client?: string | null;
  start_at: string; // ISO
  end_at?: string | null;
  kind?: 'presencial' | 'online' | 'outro' | null;
  status?: 'scheduled' | 'done' | 'canceled' | null;
};

export default function PTAgendaCard({ sessions }: { sessions: PTSess[] }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
      <div className="text-sm font-semibold opacity-70 mb-2">Agenda de hoje</div>
      {sessions.length === 0 ? (
        <div className="text-sm opacity-60">Sem sessões para hoje.</div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60">
              <div className="text-sm font-medium">
                {s.title}{s.client ? ` — ${s.client}` : ''}
              </div>
              <div className="text-xs opacity-70">
                {new Date(s.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {s.end_at ? `–${new Date(s.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                {s.kind ? ` · ${s.kind}` : ''}{s.status ? ` · ${s.status}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
