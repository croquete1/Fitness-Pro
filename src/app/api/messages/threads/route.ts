import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadChatThreadList } from '@/lib/messages/chatServer';

export async function GET(): Promise<Response> {
  const session = await getSessionUserSafe();
  const viewerId = session?.user?.id;
  if (!viewerId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  try {
    const payload = await loadChatThreadList(viewerId, session?.user?.role ?? session?.role);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[messages/chat] falha ao carregar threads', error);
    const message = error instanceof Error ? error.message : 'Não foi possível carregar as conversas.';
    return NextResponse.json({ ok: false, error: 'THREADS_FETCH_FAILED', message }, { status: 500 });
  }
}
