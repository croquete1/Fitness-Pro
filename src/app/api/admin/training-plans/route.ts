// src/app/api/admin/training-plans/route.ts
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

  const title = String(body?.title ?? '').trim();
  if (!title) return new NextResponse('Título obrigatório', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .insert([{ title, status: 'ACTIVE', trainer_id: null, client_id: null }])
    .select('id,title,status,updated_at,trainer_id,client_id')
    .single();

  if (error) return new NextResponse(error.message || 'Erro ao criar template', { status: 500 });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.TRAINING_PLAN_CREATE,
    message: 'Criação de template de plano',
    targetType: AuditTargetType.TRAINING_PLAN,
    targetId: data.id,
    diff: { after: data },
  });

  return NextResponse.json(data);
}