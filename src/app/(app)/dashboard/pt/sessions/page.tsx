export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import KpiCard from '@/components/dashboard/KpiCard';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function PTSessionsPage() {
  const user = await getSessionUserSafe();
  if (!user?.id) redirect('/login');
  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT' && role !== 'TRAINER') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [next7, next30] = await Promise.all([
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', user.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', user.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', new Date(now.getTime() + 30 * 86400000).toISOString())
    ),
  ]);

  const { data: sessions } = await sb
    .from('sessions')
    .select('id,scheduled_at,client_id,location,notes')
    .eq('trainer_id', user.id)
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(30);

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? user.name ?? user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
        role={role}
      />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
      >
        <KpiCard label="Próx. 7 dias" value={next7} variant="success" icon="📅" />
        <KpiCard label="Próx. 30 dias" value={next30} variant="info" icon="🗓️" />
      </div>

      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm">
        <div className="p-3 border-b text-sm font-semibold">Próximas sessões</div>
        <ul className="p-3 space-y-2">
          {(sessions ?? []).map((s) => (
            <li key={s.id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {new Date((s as any).scheduled_at).toLocaleString('pt-PT')}
                </div>
                <div className="text-xs opacity-70">{(s as any).location ?? '—'}</div>
              </div>
              <div className="text-xs opacity-80">
                Cliente: {(s as any).client_id ?? '—'} · {(s as any).notes ?? 'Sessão'}
              </div>
            </li>
          ))}
          {(sessions ?? []).length === 0 && (
            <li className="text-sm opacity-70 px-2 py-1">Sem sessões agendadas.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
