// src/app/api/messages/mark-read/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id, read } = await req.json().catch(() => ({} as any));
  if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });

  const sb = createServerClient();

  // Tenta 'messages'
  const res1 = await sb.from('messages').update({ read: !!read }).eq('id', id).eq('user_id', userId);
  if (!res1.error) return NextResponse.json({ ok: true });

  // Fallback 'notifications'
  await sb.from('notifications').update({ read: !!read }).eq('id', id).eq('user_id', userId);

  return NextResponse.json({ ok: true });
}
