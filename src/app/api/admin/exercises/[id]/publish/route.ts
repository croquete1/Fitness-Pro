// src/app/api/admin/exercises/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';
import { AuditKind, AuditTargetType } from '@prisma/client';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const role = user ? toAppRole((user as any).role) : null;
  if (!user?.id || !role || !isAdmin(role)) return new NextResponse('Unauthorized', { status: 401 });

  const id = params.id;
  const sb = createServerClient();

  const { data: before, error: e1 } = await sb.from('exercises').select('id,published').eq('id', id).single();
  if (e1 || !before) return new NextResponse('Exercício não encontrado', { status: 404 });

  const { data: after, error: e2 } = await sb
    .from('exercises')
    .update({ published: !before.published })
    .eq('id', id)
    .select('id,published')
    .single();

  if (e2 || !after) return new NextResponse(e2?.message || 'Falha ao atualizar', { status: 500 });

  await logAudit({
    actorId: user.id,
    kind: AuditKind.EXERCISE_PUBLISH_TOGGLE,
    message: after.published ? 'Publicou exercício' : 'Despublicou exercício',
    targetType: AuditTargetType.EXERCISE,
    targetId: id,
    diff: { before, after },
  });

  return NextResponse.json(after);
}