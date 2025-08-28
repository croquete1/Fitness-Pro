// src/app/(app)/dashboard/pt/plans/new/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Carregamos o editor no cliente
const PlanEditor = dynamic(() => import('@/components/plan/PlanEditor'), { ssr: false });

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.TRAINER && me.role !== Role.ADMIN) redirect('/dashboard');

  const initial = {
    // id indefinido em modo create
    trainerId: me.id,
    clientId: '', // deixa o editor escolher o cliente
    title: '',
    notes: null as string | null,
    status: 'ACTIVE',
    exercises: [] as any[],
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Novo plano</h1>
        <Link href="/dashboard/pt/plans" className="btn ghost">← Voltar</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {/* Apenas dados serializáveis */}
        {/* @ts-expect-error Client component */}
        <PlanEditor mode="create" initial={initial} />
      </div>
    </div>
  );
}
