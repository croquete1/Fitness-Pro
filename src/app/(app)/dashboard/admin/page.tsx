// src/app/(app)/dashboard/admin/page.tsx
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

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') {
    if (role === 'PT') redirect('/dashboard/pt' as Route);
    redirect('/dashboard/clients' as Route);
  }

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const [clients, trainers, admins, sessions7d, unreadNotifs] = await Promise.all([
    safeCount(sb, 'users', q => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', q => q.eq('role', 'PT')),
    safeCount(sb, 'users', q => q.eq('role', 'ADMIN')),
    safeCount(sb, 'sessions', q => q.gte('start_time', now.toISOString()).lt('start_time', in7.toISOString())),
    safeCount(sb, 'notifications', q => q.eq('user_id', user.id).eq('read', false)),
  ]);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <GreetingHeader name={user.name} role="ADMIN" />
      <LiveBanners />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <KpiCard label="Clientes" value={clients} />
        <KpiCard label="Treinadores" value={trainers} />
        <KpiCard label="Admins" value={admins} />
        <KpiCard label="Sessões (próx. 7d)" value={sessions7d} />
        <KpiCard label="Notificações" value={unreadNotifs} footer={<span className="text-muted small">por ler</span>} />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn chip" href={'/dashboard/admin/users' as Route}>👥 Utilizadores</Link>
          <Link className="btn chip" href={'/dashboard/admin/catalog' as Route}>📚 Catálogo</Link>
          <Link className="btn chip" href={'/dashboard/admin/plans' as Route}>📝 Planos</Link>
          <Link className="btn chip" href={'/dashboard/admin/logs' as Route}>📜 Auditoria</Link>
          <Link className="btn chip" href={'/dashboard/notifications' as Route}>🔔 Centro de notificações</Link>
        </div>
      </div>
    </div>
  );
}
