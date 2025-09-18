// src/app/api/notifications/mark-read/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ ok: false }, { status: 401 });

  const sb = createServerClient();
  await sb.from('notifications').update({ read: true }).eq('id', id).eq('user_id', uid);
  return NextResponse.json({ ok: true });
}
