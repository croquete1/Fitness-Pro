// src/app/api/pt/locations/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('trainer_locations')
    .select('id,name,travel_min')
    .eq('trainer_id', meId)
    .order('name', { ascending: true });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const { name, travel_min } = await req.json().catch(() => ({}));
  if (!name) return new NextResponse('Nome obrigatório', { status: 400 });

  const sb = createServerClient();
  const { error } = await sb
    .from('trainer_locations')
    .insert({ trainer_id: meId, name: String(name).trim(), travel_min: Number(travel_min ?? 0) });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
