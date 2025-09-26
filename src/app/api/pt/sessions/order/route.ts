import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// Body esperado: { ids: string[] }
// Atualiza sessions.order_index = posição no array, para o utilizador (PT) autenticado
export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    // atualiza um a um (defensivo; evita depender de RPC inexistente)
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      // garantir que a sessão pertence ao PT
      const { error } = await sb
        .from('sessions' as any)
        .update({ order_index: i })
        .eq('id', id)
        .eq('trainer_id', user.id);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB', detail: e?.message ?? String(e) }, { status: 500 });
  }
}
