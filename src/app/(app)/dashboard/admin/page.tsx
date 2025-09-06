export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Greeting from '@/components/dashboard/Greeting';
import Link from 'next/link';
import type { Route } from 'next';
import SessionsTrendCard from '@/components/dashboard/SessionsTrendCard';

async function safeCount(sb: ReturnType<typeof createServerClient>, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch { return 0; }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if ((toAppRole(user?.role) ?? 'CLIENT') !== 'ADMIN') {
    redirect('/dashboard' as Route);
  }

  const sb = createServerClient();

  // KPIs
  const [clients, trainers, admins, sessionsNext7] = await Promise.all([
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', (q) => q.eq('role', 'TRAINER')),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    (async () => {
      const now = new Date();
      const in7 = new Date(now); in7.setDate(now.getDate() + 7);
      return safeCount(sb, 'sessions', (q) =>
        q.gte('start_time', now.toISOString()).lt('start_time', in7.toISOString())
      );
    })(),
  ]);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <Greeting name={user?.name} role="ADMIN" />
      <LiveBanners />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Clientes</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{clients}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Treinadores</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{trainers}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Admins</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{admins}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted small">Sessões (próx. 7 dias)</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{sessionsNext7}</div>
        </div>
      </div>
      <SessionsTrendCard scope="admin" />

      {/* Atalhos de gestão */}
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
