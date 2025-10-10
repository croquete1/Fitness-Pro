// src/app/api/pt/packages/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/pt/packages/[id] — obter um pacote
export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('pt_packages' as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });

  if (role === 'PT' && data.trainer_id && data.trainer_id !== me.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.json({ ok: true, item: data });
}

// PATCH /api/pt/packages/[id] — atualizar um pacote
export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const sb = createServerClient();

  // PT não pode trocar id/trainer_id
  const safePayload =
    role === 'ADMIN'
      ? (body as Record<string, unknown>)
      : Object.fromEntries(
          Object.entries(body as Record<string, unknown>).filter(
            ([k]) => k !== 'id' && k !== 'trainer_id'
          )
        );

  let q = sb.from('pt_packages' as any).update(safePayload).eq('id', id);
  if (role === 'PT') q = q.eq('trainer_id', me.id);

  const { data, error } = await q.select('*').maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json({ ok: true, item: data });
}

// DELETE /api/pt/packages/[id] — remover um pacote
export async function DELETE(_req: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();

  let q = sb.from('pt_packages' as any).delete().eq('id', id);
  if (role === 'PT') q = q.eq('trainer_id', me.id);

  const { error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
