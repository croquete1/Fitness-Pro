import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const { role } = await req.json().catch(() => ({}));
  if (!role) return NextResponse.json({ ok: false }, { status: 400 });

  const sb = createServerClient();
  try { await sb.from('users').update({ role }).eq('id', params.id); } catch {}
  return NextResponse.json({ ok: true });
}
