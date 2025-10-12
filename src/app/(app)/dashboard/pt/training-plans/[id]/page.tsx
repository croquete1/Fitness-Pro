export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Link from 'next/link';

type PlanRow = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  trainer_id: string | null;
  updated_at: string | null;
};

export default async function PTPlanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // sessão “flat” (sem .user)
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,status,client_id,trainer_id,updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return notFound();

  const plan = data as PlanRow;

  // Se for PT, valida propriedade do plano
  if (role === 'PT' && plan.trainer_id && plan.trainer_id !== viewer.id) {
    redirect('/dashboard/pt/plans');
  }

  const updated = plan.updated_at ? new Date(plan.updated_at).toLocaleString('pt-PT') : '—';

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title={plan.title ?? 'Plano de treino'}
        subtitle={`Estado: ${plan.status ?? '—'}`}
        actions={
          <Link href={`/dashboard/pt/plans/${plan.id}/edit`} className="btn chip">
            Editar
          </Link>
        }
      />
      <Card>
        <CardContent className="space-y-2">
          <div><strong>ID:</strong> {plan.id}</div>
          <div><strong>Cliente:</strong> {plan.client_id ?? '—'}</div>
          <div><strong>Personal Trainer:</strong> {plan.trainer_id ?? '—'}</div>
          <div><strong>Atualizado:</strong> {updated}</div>
          <div className="pt-2">
            <Link href="/dashboard/pt/plans" className="btn chip">← Voltar</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
