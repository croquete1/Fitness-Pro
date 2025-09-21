import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email obrigatório' }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    process.env.APP_ORIGIN ??
    'http://localhost:3000';

  const sb = createServerClient();
  const { error } = await sb.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo: `${origin}/login/reset`,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Falha a enviar email' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
