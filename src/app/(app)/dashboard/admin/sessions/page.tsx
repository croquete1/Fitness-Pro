export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Row = {
  id: string;
  scheduled_at: string | null;
  duration_min: number | null;
  status: string | null;
  trainer: { id: string; name: string | null; email: string | null } | null;
  client:  { id: string; name: string | null; email: string | null } | null;
};

export default async function AdminSessionsHistory() {
  const me = await getSessionUserSafe();
  if (!me?.id) redirect('/login' as Route);
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data } = await sb
    .from('sessions')
    .select('id,scheduled_at,duration_min,status, trainer:users!sessions_trainer_id_fkey(id,name,email), client:users!sessions_client_id_fkey(id,name,email)')
    .order('scheduled_at', { ascending: false })
    .limit(500);

  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Histórico de sessões</h1>
      <div className="card">
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">PT</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Duração</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-slate-200/70 dark:border-slate-800/70">
                  <td className="py-2 pr-4">{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString('pt-PT') : '—'}</td>
                  <td className="py-2 pr-4">{r.trainer?.name ?? r.trainer?.email ?? '—'}</td>
                  <td className="py-2 pr-4">{r.client?.name  ?? r.client?.email  ?? '—'}</td>
                  <td className="py-2 pr-4">{r.duration_min ?? 60} min</td>
                  <td className="py-2 pr-4">
                    <span className="chip">{r.status ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-slate-500">Sem sessões registadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
