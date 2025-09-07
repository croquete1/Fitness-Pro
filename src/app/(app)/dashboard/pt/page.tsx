export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { notFound } from 'next/navigation';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Link from 'next/link';
import type { Route } from 'next';

export default async function PTDashboard() {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role) ?? 'CLIENT';

  if (role !== 'PT') return notFound();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard (PT)</h1>
      <LiveBanners />
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
