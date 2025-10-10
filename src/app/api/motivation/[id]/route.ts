import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const role = toAppRole(session?.user?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();
  try {
    await sb.from('motivation_quotes').update(body).eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const role = toAppRole(session?.user?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 403 });

  const sb = createServerClient();
  try {
    await sb.from('motivation_quotes').delete().eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
