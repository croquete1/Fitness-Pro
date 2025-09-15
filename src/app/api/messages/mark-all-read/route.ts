// src/app/api/messages/mark-all-read/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST() {
  const session = await getSessionUserSafe();
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();

  // Marca em ambas — se faltar uma tabela, a outra cobre
  await sb.from('messages').update({ read: true }).eq('user_id', userId);
  await sb.from('notifications').update({ read: true }).eq('user_id', userId);

  return NextResponse.json({ ok: true });
}
