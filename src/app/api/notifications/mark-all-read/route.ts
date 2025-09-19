// POST /api/notifications/mark-all-read
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createServerClient();
  try { await sb.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false); } catch {}
  return NextResponse.json({ ok: true });
}
