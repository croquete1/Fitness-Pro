import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type Item = { id: string; dayId: string; index: number };
type Payload = { items: Item[] };

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ ok:false, error:'Forbidden' }, { status:403 });

  let payload: Payload;
  try { payload = await req.json(); } catch { return NextResponse.json({ ok:false, error:'Invalid JSON' }, { status:400 }); }
  if (!payload.items?.length) return NextResponse.json({ ok:false, error:'Sem itens' }, { status:400 });

  const sb = createServerClient();

  // autoriza no nível do plano
  const { data: plan } = await sb
    .from('training_plans')
    .select('id, trainer_id')
    .eq('id', id)
    .maybeSingle();
  if (!plan) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  if (role !== 'ADMIN' && plan.trainer_id !== user.id) return NextResponse.json({ ok:false, error:'Forbidden' }, { status:403 });

  // aplica ordem / mudança de dia
  const updates = payload.items.map(({ id, dayId, index }) => ({
    id, day_id: dayId, order_index: index
  }));

  const { error } = await sb
    .from('training_plan_exercises')
    .upsert(updates, { onConflict: 'id', ignoreDuplicates: false });

  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 });
  return NextResponse.json({ ok:true });
}
