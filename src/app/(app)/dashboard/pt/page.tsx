// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import LiveBanners from '@/components/dashboard/LiveBanners';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import KpiCard from '@/components/dashboard/KpiCard';
import { createServerClient } from '@/lib/supabaseServer';

async function safeCount(sb: ReturnType<typeof createServerClient>, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function PTDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT') {
    if (role === 'ADMIN') redirect('/dashboard/admin' as Route);
    redirect('/dashboard/clients' as Route);
  }

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const [myClients, sessions7d, unreadNotifs] = await Promise.all([
    // tenta trainer_id ou pt_id (fallback seguro → 0 se a coluna não existir)
    safeCount(sb, 'users', q => q.eq('role', 'CLIENT').eq('trainer_id', user.id)),
    safeCount(sb, 'sessions', q => q.eq('trainer_id', user.id).gte('start_time', now.toISOString()).lt('start_time', in7.toISOString())),
    safeCount(sb, 'notifications', q => q.eq('user_id', user.id).eq('read', false)),
  ]);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <GreetingHeader name={user.name} role="PT" />
      <LiveBanners />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <KpiCard label="Meus clientes" value={myClients} />
        <KpiCard label="Sessões (próx. 7d)" value={sessions7d} />
        <KpiCard label="Notificações" value={unreadNotifs} footer={<span className="text-muted small">por ler</span>} />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn chip" href={'/dashboard/pt/clients' as Route}>🧑‍🤝‍🧑 Clientes</Link>
          <Link className="btn chip" href={'/dashboard/pt/plans' as Route}>📝 Planos</Link>
          <Link className="btn chip" href={'/dashboard/pt/sessions/calendar' as Route}>📅 Calendário</Link>
          <Link className="btn chip" href={'/dashboard/pt/settings' as Route}>⚙️ Definições</Link>
        </div>
      </div>
    </div>
  );
}
