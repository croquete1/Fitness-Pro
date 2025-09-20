// src/app/api/notifications/mark/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type Payload = {
  ids: string[];        // [] para “todas” do utilizador (opcional)
  read: boolean;        // true => marcar como lida; false => por ler
};

export async function POST(req: NextRequest) {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { ids, read } = body ?? {};
  if (typeof read !== 'boolean') {
    return NextResponse.json({ error: 'missing_read_flag' }, { status: 400 });
  }

  const sb = createServerClient();

  // Base query: apenas notificações do próprio utilizador
  let q = sb.from('notifications').update({ read }).eq('user_id', userId);

  // Quando vierem ids, restringe ao conjunto
  if (Array.isArray(ids) && ids.length > 0) {
    q = q.in('id', ids);
  }

  const { data, error } = await q.select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: data?.length ?? 0 });
}
