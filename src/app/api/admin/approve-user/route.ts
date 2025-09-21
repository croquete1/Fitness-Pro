import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabaseServer';

const schema = z.object({
  requestId: z.string().uuid(),
});

export async function POST(req: Request) {
  const { requestId } = await req.json().then(schema.parse).catch(() => ({} as any));
  if (!requestId) {
    return NextResponse.json({ ok: false, error: 'Pedido inválido' }, { status: 400 });
  }

  const sb = createServerClient();

  // 1) Buscar pedido
  const { data: reqRow, error: e1 } = await sb
    .from('register_requests')
    .select('id, name, username, email, role, status')
    .eq('id', requestId)
    .maybeSingle();

  if (e1 || !reqRow) {
    return NextResponse.json({ ok: false, error: 'Pedido não encontrado' }, { status: 404 });
  }
  if (reqRow.status !== 'PENDING') {
    return NextResponse.json({ ok: false, error: 'Pedido já tratado' }, { status: 409 });
  }

  // 2) Criar utilizador (a tua tabela "users")
  const { data: userRow, error: e2 } = await sb
    .from('users')
    .insert({
      name: reqRow.name,
      username: reqRow.username,
      email: reqRow.email.toLowerCase(),
      role: reqRow.role,
      approved: true,
    })
    .select('id, email')
    .single();

  if (e2 || !userRow) {
    return NextResponse.json({ ok: false, error: 'Falha a criar utilizador' }, { status: 500 });
  }

  // 3) Enviar link de definição de password
  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    process.env.APP_ORIGIN ??
    'http://localhost:3000';

  // resetPasswordForEmail envia um link de recuperação (serve para 1ª definição)
  const { error: eMail } = await sb.auth.resetPasswordForEmail(userRow.email, {
    redirectTo: `${origin}/login/reset`,
  });

  if (eMail) {
    // Não rebenta a aprovação por falha no email; só regista
    console.error('[approve-user] Erro a enviar email:', eMail);
  }

  // 4) Marcar pedido como aprovado
  await sb.from('register_requests').update({ status: 'APPROVED' }).eq('id', requestId);

  return NextResponse.json({ ok: true });
}
