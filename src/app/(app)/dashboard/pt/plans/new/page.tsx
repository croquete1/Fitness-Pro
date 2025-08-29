// Criar novo plano (ADMIN e TRAINER)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';

const PlanEditor = dynamicImport(() => import('@/components/plan/PlanEditor'), { ssr: false });

type Me = { id: string; role: Role };

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  const initial = {
    trainerId: me.id,
    clientId: '',
    title: '',
    notes: '',
    status: 'draft',
    exercises: [] as any[],
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ marginTop: 0 }}>Novo plano</h1>
        {/* TS dos projetos varia, por isso passo como any para evitar conflito de tipos */}
        <PlanEditor mode="create" initial={initial as any} />
      </div>
    </div>
  );
}
