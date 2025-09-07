// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import LiveBanners from '@/components/dashboard/LiveBanners';
import Link from 'next/link';

export default async function PTDashboard() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;

  // sem sessão → login
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';

  // regra de acesso: se não for PT, envia para a SUA dashboard
  if (role !== 'PT') {
    if (role === 'ADMIN') redirect('/dashboard/admin' as Route);
    redirect('/dashboard/clients' as Route);
  }

  // --- UI (mantém o que já tinhas)
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
