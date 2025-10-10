import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

type Body = {
  title?: string;
  clientId?: string | null;
  status?: PlanStatus;
};

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id, title, status, trainer_id, client_id')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'ADMIN' && data.trainer_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, plan: data });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof payload.title === 'string' && payload.title.trim().length >= 3) {
    updates.title = payload.title.trim();
  }
  if (payload.status) {
    updates.status = payload.status;
  }
  if (payload.clientId !== undefined) {
    updates.client_id = payload.clientId || null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nada para atualizar' }, { status: 400 });
  }

  const sb = createServerClient();

  // garantir que o utilizador pode editar este plano
  const { data: plan } = await sb
    .from('training_plans')
    .select('id, trainer_id')
    .eq('id', id)
    .maybeSingle();

  if (!plan) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  if (role !== 'ADMIN' && plan.trainer_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await sb
    .from('training_plans')
    .update(updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
