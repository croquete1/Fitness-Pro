import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit } from '@/lib/audit';
import { AuditKind } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getSessionUser();
    if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
    if (toAppRole(me.role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    const id = params.id;
    const body = await req.json().catch(() => ({}));
    // Só aceitamos published:boolean por agora (fácil estender depois)
    const published = typeof body?.published === 'boolean' ? body.published : null;
    if (published === null) return new NextResponse('Bad Request', { status: 400 });

    const sb = createServerClient();

    const { data: before, error: readErr } = await sb
      .from('exercises')
      .select('id, title, published')
      .eq('id', id)
      .single();

    if (readErr || !before) return new NextResponse('Not Found', { status: 404 });

    const { data: after, error: upErr } = await sb
      .from('exercises')
      .update({ published })
      .eq('id', id)
      .select('id, title, published')
      .single();

    if (upErr || !after) return new NextResponse('DB Error', { status: 500 });

    await logAudit({
      actorId: me.id,
      kind: AuditKind.ACCOUNT_STATUS_CHANGE, // enum existente
      message: published
        ? 'Exercício publicado no catálogo global'
        : 'Exercício removido do catálogo global',
      targetType: 'EXERCISE',
      targetId: id,
      diff: { before, after },
    });

    return NextResponse.json(after);
  } catch (e) {
    console.error('[exercises.patch] ', e);
    return new NextResponse('Server Error', { status: 500 });
  }
}