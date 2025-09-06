// src/app/api/pt/folgas/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

type Body = { start: string; end: string; title?: string };

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('trainer_blocks')
    .select('id,start_at,end_at,title')
    .eq('trainer_id', meId)
    .order('start_at', { ascending: false });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.start || !body.end) return new NextResponse('start/end obrigatórios', { status: 400 });

  const start = new Date(body.start), end = new Date(body.end);
  if (!(start < end)) return new NextResponse('Intervalo inválido', { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('trainer_blocks')
    .insert({ trainer_id: meId, start_at: start.toISOString(), end_at: end.toISOString(), title: body.title ?? 'Folga' })
    .select('id')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}
