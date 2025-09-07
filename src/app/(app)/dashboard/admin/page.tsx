// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;

  // sem sessão → login
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';

  // regra de acesso: se não for ADMIN, vai diretamente para a SUA dashboard
  if (role !== 'ADMIN') {
    if (role === 'PT') redirect('/dashboard/pt' as Route);
    redirect('/dashboard/clients' as Route);
  }

  // --- UI (mantém o que já tinhas, só deixei um esqueleto)
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
