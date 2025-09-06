export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import LiveBanners from '@/components/dashboard/LiveBanners';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if ((toAppRole((session as any)?.user?.role) ?? 'CLIENT') !== 'ADMIN') {
    redirect('/dashboard' as any);
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard (Admin)</h1>
      <LiveBanners />
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn chip" href="/dashboard/admin/users">👥 Utilizadores</a>
          <a className="btn chip" href="/dashboard/admin/catalog">📚 Catálogo</a>
          <a className="btn chip" href="/dashboard/admin/plans">📝 Planos</a>
          <a className="btn chip" href="/dashboard/admin/logs">📜 Auditoria</a>
        </div>
      </div>
    </div>
  );
}
