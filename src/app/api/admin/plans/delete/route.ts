import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServerClient();
  const { data: before } = await sb
    .from('training_plans')
    .select('id, title')
    .eq('id', id)
    .maybeSingle();

  const { error } = await sb.from('training_plans').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: { user } } = await sb.auth.getUser();
  const message = before?.title
    ? `Remoção do plano "${before.title}"`
    : 'Remoção de plano de treino';

  await logAudit(sb, {
    actorId: user?.id ?? null,
    kind: AUDIT_KINDS.TRAINING_PLAN_DELETE,
    targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
    targetId: String(id),
    message,
    details: { before },
  });

  return NextResponse.json({ ok: true });
}
