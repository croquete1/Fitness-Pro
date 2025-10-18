import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  trainer_id: string | null;
  trainer?:
    | { id: string; name: string | null; email: string | null }
    | Array<{ id: string; name: string | null; email: string | null }>
    | null;
};

function mapPlan(row: PlanRow) {
  const trainer = Array.isArray(row.trainer) ? row.trainer[0] : row.trainer;
  const trainerName = trainer?.name ?? trainer?.email ?? null;
  return {
    id: row.id,
    title: row.title ?? null,
    status: row.status ?? null,
    updatedAt: row.updated_at ?? null,
    trainerName,
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const { data, error } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id,trainer:users!training_plans_trainer_id_fkey(id,name,email)')
    .eq('client_id', id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    console.error('[client-plans] failed to list plans', error);
    return NextResponse.json({ error: 'failed_to_load_plans' }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((row) => mapPlan(row as PlanRow)));
}
