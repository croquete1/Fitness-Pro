// src/app/api/admin/training-plans/clone/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';
import { AuditKind, AuditTargetType } from '@prisma/client';

export async function POST(req: Request) {
  const user = await getSessionUser();
  const role = user ? toAppRole((user as any).role) : null;
  if (!user?.id || !role || !isAdmin(role)) return new NextResponse('Unauthorized', { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch { return new NextResponse('Bad Request', { status: 400 }); }

  const templateId = String(body?.templateId || '');
  const trainerId  = String(body?.trainerId  || '');
  const clientId   = body?.clientId ? String(body.clientId) : null;

  if (!templateId || !trainerId) return new NextResponse('templateId e trainerId são obrigatórios', { status: 400 });

  const sb = createServerClient();

  const { data: tpl, error: eTpl } = await sb
    .from('training_plans')
    .select('*')
    .eq('id', templateId)
    .single();

  if (eTpl || !tpl) return new NextResponse('Template não encontrado', { status: 404 });

  // remove campos que não queremos copiar literalmente
  const payload: any = {
    title: tpl.title,
    status: 'ACTIVE',
    trainer_id: trainerId,
    client_id: clientId,
    // se tiveres um JSON de exercícios, copia:
    exercises: tpl.exercises ?? null,
  };

  const { data: created, error: eIns } = await sb
    .from('training_plans')
    .insert([payload])
    .select('id,title,status,updated_at,trainer_id,client_id')
    .single();

  if (eIns || !created) return new NextResponse(eIns?.message || 'Falha ao clonar template', { status: 500 });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.TRAINING_PLAN_CLONE,
    message: 'Clonagem de template para PT',
    targetType: AuditTargetType.TRAINING_PLAN,
    targetId: created.id,
    diff: { from: templateId, to: created.id, trainerId, clientId },
  });

  return NextResponse.json(created);
}