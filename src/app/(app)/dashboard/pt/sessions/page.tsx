// src/app/(app)/dashboard/pt/sessions/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type Row = {
  id: string;
  scheduled_at: string | null;
  notes: string | null;
  location: string | null;
  client_id: string | null;
};

export default async function PTSessionsPage() {
  // 1) Sessão e guard
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) redirect('/login');

  const role = (toAppRole(sessionUser.role) ?? 'CLIENT') as AppRole;
  // ✅ apenas PT/Admin (nunca comparar com 'TRAINER')
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  // 2) Dados (próximas 7d)
  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  let sessions: Row[] = [];
  try {
    let q = sb
      .from('sessions')
      .select('id, scheduled_at, notes, location, client_id, trainer_id')
      .gte('scheduled_at', now.toISOString())
      .lt('scheduled_at', in7.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(100);

    // PT vê só as suas sessões; Admin vê todas
    if (isPT(role)) q = q.eq('trainer_id', String(sessionUser.id));

    const { data, error } = await q;
    if (!error && data) {
      sessions = data.map((s: any) => ({
        id: s.id,
        scheduled_at: s.scheduled_at ?? null,
        notes: s.notes ?? null,
        location: s.location ?? null,
        client_id: s.client_id ?? null,
      }));
    }
  } catch {
    sessions = [];
  }

  // 3) UI
  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="📅 Sessões"
        subtitle={isAdmin(role) ? 'Todas as sessões (próximos 7 dias)' : 'As tuas sessões (próximos 7 dias)'}
      />

      <Card>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-sm opacity-70">Sem sessões agendadas nos próximos 7 dias.</div>
          ) : (
            <ul className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {sessions.map((s) => (
                <li key={s.id} className="py-2 flex items-start justify-between gap-6">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}
                    </div>
                    <div className="text-sm opacity-80">
                      {s.notes ?? 'Sessão'}
                      {s.location ? ` · ${s.location}` : ''}
                    </div>
                    {s.client_id && (
                      <div className="text-xs opacity-75 font-mono">cliente: {s.client_id}</div>
                    )}
                  </div>
                  <Badge variant="neutral">Agendada</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}