// src/app/(app)/dashboard/clients/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
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

export default async function ClientDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  // Cliente e Admin podem ver esta página
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // Perfil para Greeting
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', sessionUser.user.id)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [myPlans, myUpcoming, unread] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', sessionUser.user.id)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('client_id', sessionUser.user.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) =>
      q.eq('user_id', sessionUser.user.id).eq('read', false)
    ),
  ]);

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
      />
      <LiveBanners />
      <PushBootstrap />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
      >
        <KpiCard label="Os meus planos" value={myPlans} variant="accent" icon="📝" />
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
