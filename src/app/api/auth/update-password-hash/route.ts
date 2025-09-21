import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || String(password).trim().length < 6) {
    return NextResponse.json({ ok: false, error: 'Password inválida' }, { status: 400 });
  }

  const sb = createServerClient();

  // utilizador autenticado (a partir do exchangeCodeForSession feito no cliente)
  const { data: userResp, error: eUser } = await sb.auth.getUser();
  if (eUser || !userResp?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 });
  }

  const email = userResp.user.email.toLowerCase();
  const hash = await bcrypt.hash(password, 12);

  const { error } = await sb
    .from('users')
    .update({ password_hash: hash })
    .eq('email', email);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Falha a guardar password' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
