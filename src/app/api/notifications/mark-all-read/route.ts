// src/app/api/notifications/mark-all-read/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST() {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ ok: false }, { status: 401 });

  const sb = createServerClient();
  await sb.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false);
  return NextResponse.json({ ok: true });
}
