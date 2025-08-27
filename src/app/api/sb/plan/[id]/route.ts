// src/app/api/sb/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

function canEdit(user: { id: string; role: Role }, plan: { trainer_id: string | null }) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainer_id === user.id) return true;
  return false;
}

function shallowDiff(a: any, b: any) {
  const out: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const k of keys) {
    const va = JSON.stringify(a?.[k]);
    const vb = JSON.stringify(b?.[k]);
    if (va !== vb) out[k] = { from: JSON.parse(va ?? 'null'), to: JSON.parse(vb ?? 'null') };
  }
  return out;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();

  // carregar plano atual
  const { data: current, error: e1 } = await sb
    .from('training_plans')
    .select('id,title,notes,exercises,status,trainer_id,client_id,updated_at')
    .eq('id', params.id)
    .single();
  if (e1 || !current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (!canEdit({ id: me.id, role: me.role }, current)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // body
  const body = await req.json().catch(() => ({} as any));
  const updates: any = {};
  if (typeof body.title === 'string') updates.title = body.title;
  if (typeof body.notes === 'string' || body.notes === null) updates.notes = body.notes ?? null;
  if (body.exercises !== undefined) updates.exercises = body.exercises; // JSON
  if (typeof body.status === 'string') updates.status = body.status;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'nada_para_atualizar' }, { status: 400 });
  }

  // aplicar update
  const { data: updated, error: e2 } = await sb
    .from('training_plans')
    .update(updates)
    .eq('id', params.id)
    .select('id,title,notes,exercises,status,trainer_id,client_id,updated_at')
    .single();

  if (e2 || !updated) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  // log da alteração no histórico
  const diff = shallowDiff(
    { title: current.title, notes: current.notes, exercises: current.exercises, status: current.status },
    { title: updated.title, notes: updated.notes, exercises: updated.exercises, status: updated.status },
  );

  await sb.from('training_plan_changes').insert({
    plan_id: updated.id,
    actor_id: me.id,
    change_type: 'update',
    diff,
    snapshot: updated,
  });

  return NextResponse.json({ ok: true, data: updated });
}
