import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const sb = createServerClient();

  const body = await req.json().catch(() => ({}));
  const { name, muscle_group, description } = body ?? {};

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  }

  // ⚠️ Sem owner_id: insere apenas colunas conhecidas (ajusta aos teus nomes).
  const payload: Record<string, any> = {
    name: name.trim(),
    muscle_group: muscle_group ?? null,
    description: description ?? null,
  };

  const { error } = await sb.from('exercises').insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
