import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export async function POST() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();

  const { data, error } = await sb.from('training_plans').insert({
    title: 'Novo plano',
    owner_id: guard.me.id,
    active: true,
  }).select('id, title').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'create_failed' }, { status: 400 });
  await logAudit(sb, {
    actorId: guard.me.id,
    kind: AUDIT_KINDS.TRAINING_PLAN_CREATE,
    targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
    targetId: String(data.id),
    message: 'Criação de plano de treino',
    details: { plan: data },
  });
  return NextResponse.json({ id: data.id });
}
