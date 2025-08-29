// Editar plano existente (ADMIN e TRAINER)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import dynamicImport from 'next/dynamic';

const PlanEditor = dynamicImport(() => import('@/components/plans/PlanEditor'), { ssr: false });

type Me = { id: string; role: Role };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data: plan, error } = await sb.from('training_plans').select('*').eq('id', params.id).single();
  if (error || !plan) redirect('/dashboard/pt/plans'); // not found

  // Mapeia para o formato esperado pelo editor
  const initial = {
    id: plan.id,
    trainerId: plan.trainer_id,
    clientId: plan.client_id,
    title: plan.title ?? '',
    notes: plan.notes ?? '',
    status: plan.status ?? 'draft',
    exercises: plan.exercises ?? [],
    updatedAt: plan.updated_at,
    createdAt: plan.created_at,
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ marginTop: 0 }}>Editar plano</h1>
        {/* Passo como any para evitar choques de tipos do teu projeto */}
        <PlanEditor mode="edit" initial={initial as any} />
      </div>
    </div>
  );
}
