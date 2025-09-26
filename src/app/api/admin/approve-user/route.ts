// src/app/api/admin/approve-user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Body = {
  userId?: string;     // id do profile OU email
  email?: string;      // alternativa ao userId
  approve?: boolean;   // default true
  role?: 'CLIENT' | 'TRAINER' | 'ADMIN';
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session?.user || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const approve = payload.approve ?? true;
  const wantedRole = payload.role ?? 'CLIENT';
  const target = (payload.email || payload.userId || '').toString().trim();
  if (!target) return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });

  // Tentamos identificar o utilizador por email primeiro, depois por id
  let email = payload.email?.trim();
  if (!email) {
    // procurar por id em profiles → obter email
    const { data: profById } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', target)
      .maybeSingle();

    email = profById?.email ?? undefined;
    if (!email && target.includes('@')) email = target;
  }
  if (!email) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (approve) {
    // Aprovar: atualiza role no profiles.
    const { error: upErr } = await supabaseAdmin
      .from('profiles')
      .update({ role: wantedRole })
      .eq('email', email);

    if (upErr) {
      return NextResponse.json({ error: 'Falha ao aprovar utilizador.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } else {
    // Rejeitar: aqui podes suspender/remover. Mantemos no-op (sem regressão).
    return NextResponse.json({ ok: true, rejected: true });
  }
}
