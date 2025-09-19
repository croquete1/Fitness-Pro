import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createServerClient();

  let read = true;
  try { const b = await req.json(); if (typeof b?.read === 'boolean') read = b.read; } catch {}
  try { await sb.from('notifications').update({ read }).eq('id', params.id).eq('user_id', session.user.id); } catch {}
  return NextResponse.json({ ok: true });
}
