// src/app/api/pt/folgas/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Params = { params: { id: string } };

/**
 * DELETE /api/pt/folgas/[id]
 * - ADMIN pode remover qualquer folga.
 * - PT só pode remover folgas do próprio (trainer_id = me.id).
 */
export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const id = params?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id_required' }, { status: 400 });
  }

  const sb = createServerClient();

  try {
    // Nota: usamos `as any` para não depender do tipo Database local enquanto a tabela não está mapeada.
    let q = sb.from('pt_days_off' as any).delete().eq('id', id);
    if (role === 'PT') {
      q = q.eq('trainer_id', me.id);
    }

    const { error } = await (q as any);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'delete_failed' },
      { status: 500 }
    );
  }
}
