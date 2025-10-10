import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const reason = body.reason ? String(body.reason) : null;

  // Rejeitar = SUSPENDED (ou REJECTED se usares esse estado)
  const patch: any = { status: 'SUSPENDED' };
  if (reason) patch.rejection_reason = reason;

  const { error } = await sb.from('profiles').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
