// src/app/(app)/dashboard/pt/plans/[id]/edit/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import PlanEditor from '@/components/plans/PlanEditor';

async function getPlanViaSupabase(id: string) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,notes,exercises,status,created_at,updated_at,trainer_id,client_id')
    .eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id as string,
    title: (data.title as string) ?? '',
    notes: (data.notes as string | null) ?? '',
    exercises: (data.exercises as any) ?? [],
    status: (data.status as string) ?? 'ACTIVE',
    createdAt: data.created_at as string | null,
    updatedAt: data.updated_at as string | null,
    trainerId: (data.trainer_id as string) ?? null,
    clientId: (data.client_id as string) ?? null,
  };
}

function canEdit(user: { id: string; role: Role }, plan: { trainerId: string | null }) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainerId === user.id) return true;
  return false;
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  const plan = await getPlanViaSupabase(params.id);
  if (!plan) redirect('/dashboard'); // plano não existe

  if (!canEdit({ id: me.id, role: me.role }, plan)) {
    redirect(`/dashboard/pt/plans/${plan.id}?error=${encodeURIComponent('Sem permissões para editar')}`);
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Editar plano</h1>
      <PlanEditor initialPlan={plan} />
    </div>
  );
}
