import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export async function POST(req: Request) {
  const { id, patch } = await req.json();
  if (!id || !patch) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServerClient();
  const { data: before } = await sb
    .from('training_plans')
    .select('id, title')
    .eq('id', id)
    .maybeSingle();

  const { error } = await sb.from('training_plans').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: { user } } = await sb.auth.getUser();
  const message = before?.title
    ? `Atualização do plano "${before.title}"`
    : 'Atualização de plano de treino';

  await logAudit(sb, {
    actorId: user?.id ?? null,
    kind: AUDIT_KINDS.TRAINING_PLAN_UPDATE,
    targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
    targetId: String(id),
    message,
    details: { before, patch },
  });

  return NextResponse.json({ ok: true });
}
