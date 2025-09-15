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

export default async function MyPlanPage() {
  const user = await getSessionUserSafe();
  if (!user?.id) redirect('/login');
  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [plans, upcoming, unread] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', user.id)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('client_id', user.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', user.id).eq('read', false)),
  ]);

  const { data: planList } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id')
    .eq('client_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10);

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
        <KpiCard label="Planos" value={plans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={upcoming} variant="success" icon="📅" />
        <KpiCard label="Notificações" value={unread} variant="warning" icon="🔔" />
      </div>

      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm">
        <div className="p-3 border-b text-sm font-semibold">Os meus planos</div>
        <ul className="p-3 space-y-2">
          {(planList ?? []).map((p) => (
            <li key={p.id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">{(p as any).title ?? 'Sem título'}</div>
                <div className="text-xs opacity-70">
                  {(p as any).updated_at
                    ? new Date((p as any).updated_at).toLocaleString('pt-PT')
                    : '—'}
                </div>
              </div>
              <div className="text-xs opacity-80">
                Estado: {(p as any).status ?? '—'} · PT: {(p as any).trainer_id ?? '—'}
              </div>
            </li>
          ))}
          {(planList ?? []).length === 0 && (
            <li className="text-sm opacity-70 px-2 py-1">Ainda não tens planos.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
