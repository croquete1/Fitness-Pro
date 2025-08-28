// src/app/(app)/dashboard/pt/plans/[id]/edit/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import dynamicClient from 'next/dynamic'; // <- import renomeado
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const PlanEditor = dynamicClient(() => import('@/components/plan/PlanEditor'), { ssr: false });

type SBPlan = {
  id: string;
  title: string | null;
  notes: string | null;
  status: string | null;
  exercises: any | null;
  trainer_id: string;
  client_id: string;
  updated_at: string | null;
  created_at: string | null;
};

async function getPlan(id: string): Promise<SBPlan | null> {
  const sb = createServerClient();
  const { data, error } = await sb.from('training_plans').select('*').eq('id', id).single();
  if (error) return null;
  return data as SBPlan;
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.TRAINER && me.role !== Role.ADMIN) redirect('/dashboard');

  const plan = await getPlan(params.id);
  if (!plan) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Editar plano</h1>
        <div className="card" style={{ padding: 12 }}>
          <div className="badge-danger">Plano não encontrado.</div>
          <div style={{ marginTop: 8 }}>
            <Link href="/dashboard/pt/plans" className="btn">Voltar</Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = {
    id: plan.id,
    trainerId: plan.trainer_id,
    clientId: plan.client_id,
    title: plan.title ?? '',
    notes: plan.notes,
    status: plan.status ?? 'ACTIVE',
    exercises: plan.exercises ?? [],
    updatedAt: plan.updated_at ?? null,
    createdAt: plan.created_at ?? null,
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Editar plano</h1>
        <Link href="/dashboard/pt/plans" className="btn ghost">← Voltar</Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <PlanEditor mode="edit" initial={initial} />
      </div>
    </div>
  );
}
