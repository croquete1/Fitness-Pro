import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// Body: { sessionId: string, ids: string[] } — ids de exercícios dentro da sessão
// Tabela esperada: session_exercises (ou equivalente) com colunas: session_id, exercise_id, order_index
export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { sessionId, ids } = await req.json().catch(() => ({}));
  if (!sessionId || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    // valida que a sessão é do PT
    const sess = await sb.from('sessions' as any).select('id, trainer_id').eq('id', sessionId).maybeSingle();
    if (sess.error) throw sess.error;
    if (!sess.data || String(sess.data.trainer_id) !== String(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    for (let i = 0; i < ids.length; i++) {
      const exId = ids[i];
      const { error } = await sb
        .from('session_exercises' as any)
        .update({ order_index: i })
        .eq('session_id', sessionId)
        .eq('exercise_id', exId);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB', detail: e?.message ?? String(e) }, { status: 500 });
  }
}
