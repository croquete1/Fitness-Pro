// src/app/api/sb/packages/route.ts  (POST=criar, GET=listar do próprio PT/Admin)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const mine = url.searchParams.get('mine') === '1';
  const sb = createServerClient();

  let q = sb.from('client_packages').select('*').order('created_at', { ascending: false });
  if (mine && me.role !== Role.ADMIN) q = q.eq('trainer_id', me.id);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: 'list_failed' }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const {
    trainerId = me.id,
    clientId,
    planId = null,
    packageName = 'Acompanhamento',
    sessionsTotal = 0,
    priceCents = 0,
    startDate = null,
    endDate = null,
    status = 'active',
    notes = '',
  } = body;

  if (!clientId) return NextResponse.json({ error: 'client_required' }, { status: 400 });

  // PT só pode criar para si; Admin pode para qualquer trainerId
  if (me.role !== Role.ADMIN && trainerId !== me.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const sb = createServerClient();
  const { data, error } = await sb.from('client_packages').insert({
    trainer_id: trainerId,
    client_id: clientId,
    plan_id: planId,
    package_name: packageName,
    sessions_total: sessionsTotal,
    sessions_used: 0,
    price_cents: priceCents,
    start_date: startDate,
    end_date: endDate,
    status,
    notes,
  }).select('*').single();

  if (error || !data) return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
