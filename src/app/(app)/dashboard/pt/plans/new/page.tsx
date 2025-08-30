// src/app/(app)/dashboard/pt/plans/new/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import PlanEditor from '@/components/plan/PlanEditor';

type Me = { id: string; role: Role };

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');

  // ✅ Corrigido: evitar includes, usar comparação explícita
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');

  const initial = {
    trainerId: me.role === Role.TRAINER ? me.id : '',
    clientId: '',
    title: '',
    notes: '',
    status: 'DRAFT' as any, // ajusta se tiveres enum próprio no editor
    exercises: [] as any[],
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Novo plano</h1>
        <Link className="btn" href="/dashboard/pt/plans">Voltar</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {/* PlanEditor é Client Component */}
        <PlanEditor mode="create" initial={initial} />
      </div>
    </div>
  );
}
