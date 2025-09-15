// src/app/api/pt/plans/[id]/reorder-days/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type OrderItem = { id: string; day_index: number };

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';
  // ✅ nada de 'TRAINER' – só PT ou ADMIN podem mexer
  if (!isPT(role) && !isAdmin(role)) return new NextResponse('Forbidden', { status: 403 });

  const { order = [] as OrderItem[] } =
    (await req.json().catch(() => ({}))) as { order?: OrderItem[] };

  if (!Array.isArray(order))
    return NextResponse.json({ ok: false, error: 'BAD_BODY' }, { status: 400 });

  const sb = createServerClient();

  // Atualização simples item-a-item (tabelas pequenas, seguro e claro)
  const errors: string[] = [];
  for (const it of order) {
    const { error } = await sb.from('plan_days').update({ day_index: it.day_index }).eq('id', it.id);
    if (error) errors.push(`${it.id}:${error.message}`);
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 207 }); // Multi-Status sem quebrar tudo
  }
  return NextResponse.json({ ok: true });
}