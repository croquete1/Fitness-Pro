// src/app/api/admin/approve-user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabaseServer';

type Body = { userId: string; approve?: boolean };

export async function POST(req: Request) {
  // 1) Autorização: apenas ADMIN
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // 2) Entrada
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  const { userId, approve = true } = body || {};
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'missing_userId' }, { status: 400 });
  }

  const sb = getSupabaseServer();

  // 3) Idempotente: se já está no estado desejado não dá erro
  const { data: u, error: readErr } = await sb
    .from('users')
    .select('id, approved, approved_at')
    .eq('id', userId)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ ok: false, error: 'read_failed', detail: readErr.message }, { status: 500 });
  }
  if (!u) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  const already = approve ? u.approved === true : u.approved === false;
  if (already) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  // 4) Update
  const { error: updErr } = await sb
    .from('users')
    .update({
      approved: approve,
      approved_at: approve ? new Date().toISOString() : null,
    })
    .eq('id', userId);

  if (updErr) {
    return NextResponse.json({ ok: false, error: 'update_failed', detail: updErr.message }, { status: 500 });
  }

  // 5) Notificação (se existir a tabela "notifications", ignora se não existir)
  try {
    await sb.from('notifications').insert({
      user_id: userId,
      title: approve ? 'Conta aprovada ✅' : 'Conta desativada',
      body: approve
        ? 'A tua conta foi aprovada por um administrador. Já podes iniciar sessão.'
        : 'A tua conta foi desativada. Contacta o suporte se for um erro.',
      href: '/login',
      read: false,
    });
  } catch {
    // silencioso se a tabela/políticas não existirem
  }

  return NextResponse.json({ ok: true });
}
