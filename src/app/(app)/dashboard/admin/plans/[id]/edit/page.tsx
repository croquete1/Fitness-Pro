import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import PlanBlocksEditor from './plan-editor.client';

type PageProps = {
  params: Promise<{ id: string }>;
};

type BlockRow = {
  id: string;
  title: string | null;
  order_index: number | null;
};

type PlanRow = {
  id: string;
  title: string | null;
};

function handleGuardError(status: number): never {
  if (status === 401) redirect('/login');
  redirect('/dashboard');
}

function normaliseOrder(rows: BlockRow[]): BlockRow[] {
  return [...rows]
    .map((row, index) => ({
      ...row,
      order_index:
        typeof row.order_index === 'number' && Number.isFinite(row.order_index)
          ? row.order_index
          : index,
    }))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) {
    const status = guard.response?.status ?? 302;
    handleGuardError(status);
  }
  const sb = createServerClient();

  const [{ data: plan, error: planError }, { data: blocks, error: blocksError }] = await Promise.all([
    sb
      .from('training_plans')
      .select('id, title')
      .eq('id', id)
      .maybeSingle<PlanRow>(),
    sb
      .from('training_plan_blocks')
      .select('id, title, order_index')
      .eq('plan_id', id)
      .order('order_index', { ascending: true })
      .returns<BlockRow[]>(),
  ]);

  if (planError?.code === 'PGRST116' || (!plan && !planError)) {
    redirect('/dashboard/admin/plans');
  }
  if (planError) {
    throw planError;
  }
  if (blocksError) {
    throw blocksError;
  }

  const initialBlocks = normaliseOrder(blocks ?? []);

  return (
    <PlanBlocksEditor
      planId={id}
      planTitle={plan?.title ?? 'Plano'}
      initialItems={initialBlocks.map((row) => ({
        id: row.id,
        title: row.title ?? 'Bloco sem título',
        order_index: row.order_index ?? 0,
      }))}
      actor={guard.me}
    />
  );
}
