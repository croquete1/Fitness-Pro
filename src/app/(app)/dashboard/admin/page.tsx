// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { notFound } from 'next/navigation';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Link from 'next/link';
import type { Route } from 'next';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role) ?? 'CLIENT';

  // ❌ Nada de redirect('/dashboard') aqui — isso causa loop com /dashboard
  if (role !== 'ADMIN') return notFound();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard (Admin)</h1>
      <LiveBanners />
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
