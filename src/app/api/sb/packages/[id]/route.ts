// src/app/api/sb/packages/[id]/route.ts  (PATCH/DELETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();

  // carregar pacote
  const { data: pkg, error: e1 } = await sb.from('client_packages').select('*').eq('id', params.id).single();
  if (e1 || !pkg) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Permissões: Admin ou PT dono
  if (me.role !== Role.ADMIN && pkg.trainer_id !== me.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as any));
  const patch: any = {};
  for (const k of [
    'packageName','sessionsTotal','sessionsUsed','priceCents','startDate','endDate','status','notes','planId','trainerId','clientId'
  ]) if (k in body) patch[k] = body[k];

  const updates: any = {
    ...(patch.packageName !== undefined ? { package_name: patch.packageName } : {}),
    ...(patch.sessionsTotal !== undefined ? { sessions_total: patch.sessionsTotal } : {}),
    ...(patch.sessionsUsed !== undefined ? { sessions_used: patch.sessionsUsed } : {}),
    ...(patch.priceCents !== undefined ? { price_cents: patch.priceCents } : {}),
    ...(patch.startDate !== undefined ? { start_date: patch.startDate } : {}),
    ...(patch.endDate !== undefined ? { end_date: patch.endDate } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    ...(patch.planId !== undefined ? { plan_id: patch.planId } : {}),
  };
  // Admin pode reatribuir trainer/client
  if (me.role === Role.ADMIN) {
    if (patch.trainerId !== undefined) updates.trainer_id = patch.trainerId;
    if (patch.clientId !== undefined)  updates.client_id  = patch.clientId;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const { data, error } = await sb
    .from('client_packages')
    .update(updates).eq('id', params.id)
    .select('*').single();

  if (error || !data) return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();

  const { data: pkg, error: e1 } = await sb.from('client_packages').select('trainer_id').eq('id', params.id).single();
  if (e1 || !pkg) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (me.role !== Role.ADMIN && pkg.trainer_id !== me.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { error } = await sb.from('client_packages').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
