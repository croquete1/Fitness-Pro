// src/app/api/sessions/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { touchSessions } from '@/lib/revalidate';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 }); }

  const patch: Record<string, any> = {};
  const allowed = ['scheduled_at','location','status','notes','trainer_id','client_id'];
  for (const k of allowed) if (k in body) patch[k] = body[k];

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: false, error: 'EMPTY_PATCH' }, { status: 400 });
  }

  const { error } = await sb.from('sessions').update(patch).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  touchSessions();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  touchSessions();
  return NextResponse.json({ ok: true });
}
