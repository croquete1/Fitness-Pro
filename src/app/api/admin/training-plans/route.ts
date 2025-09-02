// src/app/api/admin/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole((me as any).role) !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const supabase = createServerClient();
  const body = await req.json().catch(() => ({} as any));

  // cria o plano (ajusta os campos ao teu schema)
  const payload = {
    title: body?.title ?? 'Novo plano',
    client_id: body?.clientId ?? null,
    trainer_id: body?.trainerId ?? me.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('training_plans')
    .insert(payload)
    .select('id, title, client_id, trainer_id')
    .single();

  if (error || !created) {
    return NextResponse.json({ ok: false, error: 'CREATE_FAILED' }, { status: 500 });
  }

  // ✅ Audit SEM strings “cruas”
  await logAudit({
    actorId: me.id,
    kind: AUDIT_KINDS.TRAINING_PLAN_CREATE,              // <<< era string solta
    message: 'Criação de plano de treino',
    targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
    targetId: String(created.id),                        // garante string
    diff: { plan: { id: created.id, title: created.title } },
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}