// src/app/api/admin/exercises/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole(user.role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const id = params.id;
  const body = await req.json().catch(() => ({}));
  const publish = !!body?.publish; // true = publicar, false = retirar

  const supabase = createServerClient();

  const { data: before } = await supabase
    .from('exercises')
    .select('id, name, published')
    .eq('id', id)
    .single();

  const { data: updated, error } = await supabase
    .from('exercises')
    .update({ published: publish })
    .eq('id', id)
    .select()
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  await logAudit({
    actorId: user.id,
    kind: 'EXERCISE_PUBLISH_TOGGLE',
    message: publish ? 'Publicar exercício no catálogo global' : 'Retirar exercício do catálogo global',
    targetType: 'EXERCISE',
    targetId: id,
    diff: { before, after: updated },
  });

  return NextResponse.json(updated ?? { id, published: publish });
}