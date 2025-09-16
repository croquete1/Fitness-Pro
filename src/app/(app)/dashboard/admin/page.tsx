// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(
  sb: SB,
  table: string,
  build?: (q: any) => any
): Promise<number> {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();

  // sessão válida?
  if (!sessionUser?.user?.id) redirect('/login');

  // role normalizada (toAppRole já trata TRAINER -> PT)
  const role = (toAppRole(sessionUser.user.role) ?? 'CLIENT') as AppRole;

  // só ADMIN fica aqui; PT vai para /dashboard/pt; cliente para /dashboard/clients
  if (role !== 'ADMIN') {
    if (role === 'PT') redirect('/dashboard/pt');
    redirect('/dashboard/clients');
  }

  const sb = createServerClient();
  const userId = sessionUser.user.id;

  // perfil para greeting (nome/avatar)
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [clients, trainers, admins, sessions7d, unreadNotifs] = await Promise.all([
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    // conta PT + TRAINER (DB pode ter as duas grafias)
    safeCount(sb, 'users', (q) => q.in('role', ['PT', 'TRAINER'])),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    safeCount(
      sb,
      'sessions',
      (q) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', userId).eq('read', false)),
  ]);

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
        role="ADMIN"
      />
      <LiveBanners />
      <PushBootstrap />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}
      >
        <KpiCard label="Clientes" value={clients} variant="primary" icon="🧑‍🤝‍🧑" />
        <KpiCard label="Treinadores" value={trainers} variant="accent" icon="🏋️" />
        <KpiCard label="Admins" value={admins} variant="info" icon="🛡️" />
        <KpiCard label="Sessões (7d)" value={sessions7d} variant="success" icon="📅" />
        <KpiCard
          label="Notificações"
          value={unreadNotifs}
          variant="warning"
          icon="🔔"
          footer={<span className="text-muted small">por ler</span>}
        />
      </div>

      <div className="card p-3">
        <div className="flex gap-2 flex-wrap">
          <Link className="btn chip" href="/dashboard/admin/users">👥 Utilizadores</Link>
          <Link className="btn chip" href="/dashboard/admin/approvals">✅ Aprovações</Link>
          <Link className="btn chip" href="/dashboard/admin/exercises">📚 Exercícios</Link>
          <Link className="btn chip" href="/dashboard/admin/plans">📝 Planos</Link>
          <Link className="btn chip" href="/dashboard/notifications">🔔 Centro de notificações</Link>
        </div>
      </div>
    </div>
  );
}
