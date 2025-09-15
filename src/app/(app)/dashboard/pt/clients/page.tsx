export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import KpiCard from '@/components/dashboard/KpiCard';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';

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

export default async function PTClientsPage() {
  const user = await getSessionUserSafe();
  if (!user?.id) redirect('/login');

  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
    safeCount(sb, 'trainer_clients', (q) => q.eq('trainer_id', user.id)),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', user.id)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', user.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', user.id).eq('read', false)),
  ]);

  // lista rápida (top 20) dos meus clientes
  const { data: rows } = await sb
    .from('trainer_clients')
    .select('client_id, clients:users(id,name,email,created_at)')
    .eq('trainer_id', user.id)
    .limit(20);

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? user.name ?? user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
        role={role}
      />
      <LiveBanners />
      <PushBootstrap />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
      >
        <KpiCard label="Clientes" value={myClients} variant="primary" icon="👥" />
        <KpiCard label="Planos" value={myPlans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={myUpcoming} variant="success" icon="📅" />
        <KpiCard
          label="Notificações"
          value={unread}
          variant="warning"
          icon="🔔"
          footer={<span className="small text-muted">por ler</span>}
        />
      </div>

      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm">
        <div className="p-3 border-b text-sm font-semibold">Os meus clientes</div>
        <ul className="p-3 space-y-2">
          {(rows ?? []).map((r: any) => (
            <li key={r.client_id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {r.clients?.name ?? r.clients?.email ?? r.client_id}
                </div>
                <div className="text-xs opacity-70">
                  {r.clients?.created_at
                    ? new Date(r.clients.created_at).toLocaleDateString('pt-PT')
                    : '—'}
                </div>
              </div>
              <div className="text-xs opacity-80">{r.clients?.email ?? '—'}</div>
            </li>
          ))}
          {(rows ?? []).length === 0 && (
            <li className="text-sm opacity-70 px-2 py-1">Sem clientes associados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
