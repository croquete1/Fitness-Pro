// src/app/(app)/dashboard/pt/plans/new/page.tsx
import { redirect } from 'next/navigation';
import NextDynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, Status } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Carrega o editor no cliente (SSR off)
const PlanEditor = NextDynamic(() => import('@/components/plan/PlanEditor'), { ssr: false });

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  // `InitialPlan`: garantir que status é enum (NÃO string)
  const initial = {
    trainerId: me.id as string,
    clientId: '', // podes pré-preencher se vier via query param
    title: '',
    notes: '',
    status: Status.ACTIVE, // <-- FIX: enum, não 'ACTIVE' string
    exercises: [] as any[],
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Criar plano</h1>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <PlanEditor mode="create" initial={initial} />
      </div>
    </div>
  );
}
