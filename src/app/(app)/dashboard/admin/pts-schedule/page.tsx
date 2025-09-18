// src/app/(app)/dashboard/admin/pt-schedule/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  location: string | null;
  trainer_id: string | null;
  client_id: string | null;
  notes: string | null;
};

type UserRow = { id: string; name: string | null; email: string };

export default async function AdminPTSchedulePage() {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) redirect('/login');

  // só admins
  const role = String(me.user.role ?? '').toUpperCase();
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  // 1) sessões (simples)
  const { data: sessionsRaw } = await sb
    .from('sessions')
    .select('id,scheduled_at,location,trainer_id,client_id,notes')
    .gte('scheduled_at', now.toISOString())
    .lt('scheduled_at', in7.toISOString())
    .order('scheduled_at', { ascending: true });

  const sessions = (sessionsRaw ?? []) as SessionRow[];

  // 2) carregar trainers e clients (em 2 chamadas “in”)
  const trainerIds = Array.from(new Set(sessions.map(s => s.trainer_id).filter(Boolean))) as string[];
  const clientIds  = Array.from(new Set(sessions.map(s => s.client_id).filter(Boolean))) as string[];

  const [{ data: trainers }, { data: clients }] = await Promise.all([
    trainerIds.length ? sb.from('users').select('id,name,email').in('id', trainerIds) : Promise.resolve({ data: [] as UserRow[] }),
    clientIds.length  ? sb.from('users').select('id,name,email').in('id', clientIds)   : Promise.resolve({ data: [] as UserRow[] }),
  ]);

  const tMap = new Map((trainers ?? []).map(u => [u.id, u as UserRow]));
  const cMap = new Map((clients  ?? []).map(u => [u.id, u as UserRow]));

  // Agrupar por trainer
  const groups = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const key = s.trainer_id ?? 'sem-trainer';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader title="📅 Agenda dos PTs" subtitle="Próximos 7 dias." />
      {[...groups.entries()].map(([trainerId, list]) => {
        const t = tMap.get(trainerId);
        return (
          <Card key={trainerId}>
            <CardContent className="space-y-2">
              <div className="font-semibold">
                {t ? (t.name ?? t.email) : '— PT não definido —'}
              </div>
              <ul className="grid gap-2">
                {list.map(s => {
                  const cli = s.client_id ? cMap.get(s.client_id) : null;
                  return (
                    <li key={s.id} className="rounded-lg border p-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}
                        </div>
                        <div className="text-xs opacity-70">{s.location ?? '—'}</div>
                      </div>
                      <div className="text-sm opacity-80">
                        Cliente: {cli ? (cli.name ?? cli.email) : '—'}
                      </div>
                      {s.notes && <div className="text-sm opacity-80 mt-1">{s.notes}</div>}
                    </li>
                  );
                })}
                {list.length === 0 && <li className="text-sm opacity-70">Sem marcações.</li>}
              </ul>
            </CardContent>
          </Card>
        );
      })}
      {groups.size === 0 && <div className="text-sm opacity-70">Sem sessões marcadas nos próximos 7 dias.</div>}
    </main>
  );
}
