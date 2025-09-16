// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import KpiCard from '@/components/dashboard/KpiCard';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

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

export default async function PTDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  // Apenas PT ou ADMIN
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const userId = sessionUser.user.id;

  // Perfil para saudação (nome + avatar)
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
    safeCount(sb, 'trainer_clients', (q) => q.eq('trainer_id', userId)),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', userId)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', userId)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', userId).eq('read', false)),
  ]);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <GreetingHeader
        name={prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador'}
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
    </div>
  );
}
