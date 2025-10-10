// src/app/api/pt/training-plans/[id]/reorder-days/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  const me = (await getSessionUserSafe()) as any;
  const meId = me?.id ?? me?.user?.id;
  const role = toAppRole(me?.role ?? me?.user?.role) ?? 'CLIENT';
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const order = Array.isArray(body?.order) ? (body.order as Array<{ id: string; day_index: number }>) : [];
  if (!order.length) return NextResponse.json({ ok: true });

  const { id } = await ctx.params;
  const { data: days } = await sb.from('plan_days').select('id').eq('plan_id', id);
  const allowed = new Set((days ?? []).map((d) => d.id));

  await Promise.all(
    order.filter((o) => allowed.has(o.id)).map(({ id, day_index }) =>
      sb.from('plan_days').update({ day_index }).eq('id', id),
    ),
  );

  return NextResponse.json({ ok: true });
}
