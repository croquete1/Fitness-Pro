import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

// Aceita payload com idx OU order_index (fazemos mapping)
type MoveIdx = { id: string; day_id: string; idx: number };
type MoveOrderIndex = { id: string; day_id: string; order_index: number };
type Move = MoveIdx | MoveOrderIndex;

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) return new NextResponse('Forbidden', { status: 403 });

  const { moves = [] as Move[] } =
    (await req.json().catch(() => ({}))) as { moves?: Move[] };
  if (!Array.isArray(moves)) {
    return NextResponse.json({ ok: false, error: 'BAD_BODY' }, { status: 400 });
  }

  const sb = createServerClient();
  const errors: string[] = [];

  for (const m of moves) {
    const order_index =
      'order_index' in m ? m.order_index : (m as MoveIdx).idx;

    const { error } = await sb
      .from('plan_exercises')
      .update({ day_id: m.day_id, order_index })
      .eq('id', m.id);

    if (error) errors.push(`${m.id}:${error.message}`);
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }
  return NextResponse.json({ ok: true });
}