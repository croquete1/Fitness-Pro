// src/app/api/pt/plans/[id]/reorder-items/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Move = { id: string; day_id: string; idx: number };

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  // ✅ sem 'TRAINER'
  if (!isPT(role) && !isAdmin(role)) return new NextResponse('Forbidden', { status: 403 });

  const { moves = [] as Move[] } =
    (await req.json().catch(() => ({}))) as { moves?: Move[] };

  if (!Array.isArray(moves))
    return NextResponse.json({ ok: false, error: 'BAD_BODY' }, { status: 400 });

  const sb = createServerClient();
  const errors: string[] = [];

  for (const m of moves) {
    const { error } = await sb
      .from('plan_exercises') // alinhado com o teu schema
      .update({ day_id: m.day_id, idx: m.idx })
      .eq('id', m.id);
    if (error) errors.push(`${m.id}:${error.message}`);
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }
  return NextResponse.json({ ok: true });
}