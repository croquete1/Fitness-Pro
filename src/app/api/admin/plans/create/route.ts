import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export async function POST() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { data, error } = await sb.from('training_plans').insert({
    title: 'Novo plano',
    owner_id: user.id,
    active: true,
  }).select('id, title').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'create_failed' }, { status: 400 });
  await logAudit(sb, {
    actorId: user.id,
    kind: AUDIT_KINDS.TRAINING_PLAN_CREATE,
    targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
    targetId: String(data.id),
    message: 'Criação de plano de treino',
    details: { plan: data },
  });
  return NextResponse.json({ id: data.id });
}
