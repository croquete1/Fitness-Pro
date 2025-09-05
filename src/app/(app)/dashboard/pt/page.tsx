// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import PTWalletView from './PTWalletView';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || !user.id) {
    redirect('/login');
  }

  const role = toAppRole(user.role);
  if (!role || (role !== 'ADMIN' && role !== 'PT')) redirect('/dashboard');

  return (
    <div style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div
        className="card"
        style={{
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <h1>
          {role === 'PT' ? 'Minha carteira' : 'Carteira (Admin)'}
        </h1>
      </div>

      <div className="card" style={{ padding: 8 }}>
        <PTWalletView meId={user.id} isAdmin={role === 'ADMIN'} />
      </div>
    </div>
  );
}
