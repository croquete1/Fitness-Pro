import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

type Body = {
  measured_at: string; // ISO
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
};

export async function GET() {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('anthropometry')
    .select('id, measured_at, weight_kg, height_cm, body_fat_pct')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true });
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload?.measured_at) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const insert = {
    user_id: user.id,
    measured_at: payload.measured_at,
    weight_kg: payload.weight_kg,
    height_cm: payload.height_cm,
    body_fat_pct: payload.body_fat_pct,
  };
  const { error } = await sb.from('anthropometry').insert(insert);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
