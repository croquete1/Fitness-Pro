import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// ... (GET e PATCH que já entreguei antes, mantêm-se iguais)

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();

  // 1) Tentar "remoção suave" (desativar) para permitir UNDO seguro
  let softTried = false;
  try {
    softTried = true;
    await sb.from('users').update({ active: false, is_active: false }).eq('id', params.id);
    return NextResponse.json({ ok: true, soft: true });
  } catch { /* cai para hard delete */ }

  // 2) Remoção real (fallback quando não há coluna active)
  const a = await sb.from('users').delete().eq('id', params.id);
  if (!a.error) return NextResponse.json({ ok: true, soft: false });

  return NextResponse.json({ error: a.error.message, soft: softTried }, { status: 400 });
}
