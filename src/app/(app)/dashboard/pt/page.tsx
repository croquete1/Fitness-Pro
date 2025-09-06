export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import LiveBanners from '@/components/dashboard/LiveBanners';

export default async function PTDashboard() {
  const session = await getServerSession(authOptions);
  if ((toAppRole((session as any)?.user?.role) ?? 'CLIENT') !== 'PT') {
    redirect('/dashboard' as any);
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard (PT)</h1>
      <LiveBanners />
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn chip" href="/dashboard/pt/clients">🧑‍🤝‍🧑 Clientes</a>
          <a className="btn chip" href="/dashboard/pt/plans">📝 Planos</a>
          <a className="btn chip" href="/dashboard/pt/sessions/calendar">📅 Calendário</a>
          <a className="btn chip" href="/dashboard/pt/settings">⚙️ Definições</a>
        </div>
      </div>
    </div>
  );
}
