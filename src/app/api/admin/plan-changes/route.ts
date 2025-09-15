import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type PlanChangeRow = {
  id: string;
  plan_id: string;
  kind: string;
  actor_id: string | null;
  meta: unknown | null;
  created_at: string;
};

export async function GET(): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  // Tabela sugerida: plan_changes (id, plan_id, kind, actor_id, meta JSONB, created_at)
  const { data, error } = await sb
    .from('plan_changes')
    .select('id,plan_id,kind,actor_id,meta,created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items: (data ?? []) as PlanChangeRow[] }, { status: 200 });
}
