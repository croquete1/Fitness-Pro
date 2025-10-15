import * as React from 'react';

import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type StatusTone = 'ok' | 'warn' | 'down';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
}

function statusTone(value: string | null | undefined): StatusTone {
  if (!value) return 'warn';
  const normalized = value.toString().trim().toLowerCase();
  if (normalized === 'done' || normalized === 'concluido' || normalized === 'concluído') return 'ok';
  if (normalized === 'cancelled' || normalized === 'cancelado') return 'down';
  return 'warn';
}

export default async function PtUpcomingTable() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) return null;

  const sb = createServerClient();
  const now = new Date();

  const { data: upcoming } = await sb
    .from('sessions')
    .select('id, scheduled_at, location, status, client_id')
    .eq('trainer_id', user.id)
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(6);

  const rows = Array.isArray(upcoming) ? upcoming : [];

  return (
    <section className="neo-panel space-y-4" aria-labelledby="pt-upcoming-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="pt-upcoming-heading" className="neo-panel__title">
            Próximas sessões
          </h2>
          <p className="neo-panel__subtitle">Compromissos iminentes para reforçar o acompanhamento.</p>
        </div>
        <span className="status-pill" data-state={rows.length > 0 ? 'ok' : 'warn'}>
          {rows.length > 0 ? `${rows.length} agendada(s)` : 'Sem sessões'}
        </span>
      </div>

      <div className="neo-table-wrapper">
        <table className="neo-table">
          <thead>
            <tr>
              <th scope="col">Data & hora</th>
              <th scope="col">Local</th>
              <th scope="col">Estado</th>
              <th scope="col">Cliente</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-center text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/30">
                    Nenhuma sessão nas próximas horas. Usa a agenda para agendar novo encontro.
                  </div>
                </td>
              </tr>
            )}
            {rows.map((session) => (
              <tr key={session.id}>
                <td>{formatDateTime(session.scheduled_at)}</td>
                <td>{session.location ?? 'A definir'}</td>
                <td>
                  <span className="status-pill" data-state={statusTone(session.status)}>
                    {session.status ?? '—'}
                  </span>
                </td>
                <td>{session.client_id ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
