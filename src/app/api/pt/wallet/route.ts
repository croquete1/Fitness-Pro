// src/app/api/pt/wallet/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

function fromDate(range: 'today'|'7d'|'30d'|'all'): string | null {
  const now = new Date();
  if (range === 'all') return null;
  if (range === 'today') { const d = new Date(now); d.setHours(0,0,0,0); return d.toISOString(); }
  const d = new Date(now);
  d.setDate(d.getDate() - (range === '7d' ? 7 : 30));
  return d.toISOString();
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((session.user as any).role);
  if (!role || (!isAdmin(role) && !isPT(role))) return new NextResponse('Forbidden', { status: 403 });

  const url = new URL(req.url);
  const range = (url.searchParams.get('range') ?? '30d') as 'today'|'7d'|'30d'|'all';
  const userId = String(session.user.id);
  const from = fromDate(range);

  const supabase = supabaseAdmin();
  let q = supabase
    .from('wallet_transactions')
    .select('id,date,kind,amount,description')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1000);

  if (from) q = q.gte('date', from);

  const { data, error } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  const txs = (data ?? []).map((t: any) => ({
    id: t.id,
    date: new Date(t.date).toISOString(),
    kind: t.kind as 'credit'|'debit',
    amount: Number(t.amount),
    description: t.description as string | null,
  }));

  const income = txs.filter(t => t.kind === 'credit').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.kind === 'debit').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return NextResponse.json({
    ok: true,
    range,
    summary: { balance, income, expense },
    transactions: txs,
  });
}
