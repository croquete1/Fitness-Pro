import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ ok: false }, { status: 200 });

  const sb = createServerClient();
  try {
    await sb.from('notifications').update({ read: true }).eq('id', params.id).eq('user_id', uid);
  } catch {}
  return NextResponse.json({ ok: true });
}
