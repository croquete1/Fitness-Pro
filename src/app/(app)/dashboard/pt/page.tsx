// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import PTWalletView from './PTWalletView';

type Me = { id: string; role: Role };

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;

  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');

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
        <h1 style={{ margin: 0, fontSize: 18 }}>
          {me.role === Role.TRAINER ? 'Minha carteira' : 'Carteira (Admin)'}
        </h1>
      </div>

      <div className="card" style={{ padding: 8 }}>
        <PTWalletView meId={me.id} isAdmin={me.role === Role.ADMIN} />
      </div>
    </div>
  );
}