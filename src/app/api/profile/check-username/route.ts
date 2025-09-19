import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

function isValidUsername(u: string) {
  // 3–24, letras/números/._, começa por letra/número, não termina com ponto/underscore/traço
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{1,22})[a-zA-Z0-9]$/.test(u);
}

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false, available: false }, { status: 401 });

  const sb = createServerClient();
  const q = (req.nextUrl.searchParams.get('q') || '').trim();

  if (!q) return NextResponse.json({ ok: true, available: false, reason: 'empty' });
  if (!isValidUsername(q)) {
    return NextResponse.json({ ok: true, available: false, reason: 'invalid_format' });
  }

  try {
    // username único, case-insensitive; ignora o próprio utilizador
    const { data, error } = await sb
      .from('users')
      .select('id')
      .ilike('username', q)
      .neq('id', session.user.id)
      .limit(1);

    if (error) return NextResponse.json({ ok: false, available: false }, { status: 500 });

    const taken = (data ?? []).length > 0;
    return NextResponse.json({ ok: true, available: !taken });
  } catch {
    // Se a coluna não existir, devolvemos not_supported para evitares UX enganosa
    return NextResponse.json({ ok: false, available: false, reason: 'not_supported' }, { status: 501 });
  }
}
