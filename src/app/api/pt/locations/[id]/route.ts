// src/app/api/pt/locations/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(
  _req: Request,
  ctx: Ctx
): Promise<Response> {
  const { id } = await ctx.params;
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const sb = createServerClient();

  try {
    // Admin pode apagar qualquer registo; PT só os seus
    let q = sb.from('pt_locations' as any).delete().eq('id', id);
    if (role !== 'ADMIN') q = q.eq('trainer_id', me.id);

    // select('id') para sabermos se algo foi apagado
    const { data, error } = await q.select('id');

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message ?? 'delete_failed' },
        { status: 500 }
      );
    }

    const deleted = Array.isArray(data) ? data.length : data ? 1 : 0;
    if (deleted === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'unexpected_error' },
      { status: 500 }
    );
  }
}
