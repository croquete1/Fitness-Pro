// src/app/api/admin/exercises/[id]/publish/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/exercises/:id/publish
 * Body opcional: { publish?: boolean }
 *  - Se publish não vier, faz toggle com base no estado atual.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const user = await getSessionUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const role = toAppRole((user as any).role);
    if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    const supabase = createServerClient();

    // 1) Ler body (publish opcional)
    let desired: boolean | undefined;
    try {
      const body = await req.json();
      if (typeof body?.publish === 'boolean') desired = body.publish;
    } catch {
      // ignorar erro de JSON
    }

    // 2) Se não recebido, obter estado atual e fazer toggle
    if (typeof desired === 'undefined') {
      const { data: current, error: errGet } = await supabase
        .from('exercises')
        .select('id, is_published')
        .eq('id', id)
        .single();

      if (errGet || !current) {
        return new NextResponse('Not Found', { status: 404 });
      }
      desired = !current.is_published;
    }

    // 3) Atualizar o exercício
    const patch = {
      is_published: desired,
      published_at: desired ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: errUpd } = await supabase
      .from('exercises')
      .update(patch)
      .eq('id', id)
      .select('id, name, is_published, published_at, updated_at')
      .single();

    if (errUpd || !updated) {
      return new NextResponse('Failed to update', { status: 500 });
    }

    // 4) Audit com enums (sem strings soltas)
    await logAudit({
      actorId: user.id,
      kind: desired ? AUDIT_KINDS.EXERCISE_PUBLISH : AUDIT_KINDS.EXERCISE_UNPUBLISH,
      message: desired
        ? 'Publicar exercício no catálogo global'
        : 'Retirar exercício do catálogo global',
      targetType: AUDIT_TARGET_TYPES.EXERCISE,
      targetId: id,
      diff: { is_published: desired },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[admin/exercises/:id/publish] error:', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}