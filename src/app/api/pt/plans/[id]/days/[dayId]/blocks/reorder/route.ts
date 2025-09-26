import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Pair = { id: string; order_index: number };
type Body =
  | { ids: string[] }
  | { order: Pair[] };

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; dayId: string } }
) {
  const { id: planId, dayId } = params;
  const sb = createServerClient();

  // 1) Auth
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  // 2) Autorização (trainer dono do plano ou admin)
  let allowed = false;
  try {
    const plan = await sb
      .from('plans' as any)
      .select('id, trainer_id, created_by, owner_id')
      .eq('id', planId)
      .maybeSingle();

    const owner =
      (plan.data as any)?.trainer_id ??
      (plan.data as any)?.created_by ??
      (plan.data as any)?.owner_id;

    if (owner && owner === user.id) allowed = true;
  } catch {}

  if (!allowed) {
    try {
      const prof = await sb.from('profiles' as any).select('role').eq('id', user.id).maybeSingle();
      if (String((prof.data as any)?.role).toUpperCase() === 'ADMIN') allowed = true;
    } catch {}
  }
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // 3) Body
  const body = (await req.json().catch(() => ({}))) as Body;
  let pairs: Pair[] = [];
  if ('order' in body && Array.isArray(body.order)) {
    pairs = body.order.map(x => ({ id: String(x.id), order_index: Number(x.order_index) }));
  } else if ('ids' in body && Array.isArray(body.ids)) {
    pairs = body.ids.map((bid, idx) => ({ id: String(bid), order_index: idx }));
  } else {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // 4) Persistência tolerante ao schema
  const candidateTables = ['plan_day_blocks', 'day_blocks', 'plan_blocks', 'blocks', 'session_blocks'] as const;
  const dayCols = ['day_id', 'plan_day_id', 'session_day_id'] as const;
  const orderCols = ['order_index', 'position', 'sort', 'sort_index'] as const;

  // 🔧 TS escape hatch só na parte dinâmica
  const sba: any = sb;

  for (const table of candidateTables) {
    for (const dayCol of dayCols) {
      for (const ordCol of orderCols) {
        try {
          let okCount = 0;

          // usar Promise.all para reduzir latência (e também evitar inferência encadeada em excesso)
          const results: Array<{ error: any } | undefined> = await Promise.all(
            pairs.map(async (p) => {
              try {
                const { error } = await sba
                  .from(table)
                  .update({ [ordCol]: p.order_index })
                  .eq('id', p.id)
                  .eq(dayCol, dayId);
                if (!error) okCount++;
                return { error };
              } catch {
                return { error: true };
              }
            })
          );

          if (okCount > 0) {
            return NextResponse.json({
              ok: true,
              updated: okCount,
              table,
              dayCol,
              orderCol: ordCol,
            });
          }
        } catch {
          // tenta próximo combo
        }
      }
    }
  }

  // 5) Fallback via RPC (opcional)
  try {
    const { error } = await sba.rpc?.('reorder_day_blocks', {
      p_day_id: dayId,
      p_order: pairs as any,
    });
    if (!error) return NextResponse.json({ ok: true, updated: pairs.length, rpc: 'reorder_day_blocks' });
  } catch {}

  return NextResponse.json({ error: 'No matching table/columns to update.' }, { status: 400 });
}
