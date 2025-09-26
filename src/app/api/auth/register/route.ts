// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { RegisterSchema } from '@/lib/validation/auth';
import { hashPassword } from '@/lib/hash';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    const { email, password, name, role } = parsed.data;

    // 1) já existe email?
    const { data: exists } = await supabaseAdmin
      .from('auth_local_users').select('id').eq('email', email).maybeSingle();
    if (exists) {
      return NextResponse.json({ error: 'Email já registado.' }, { status: 409 });
    }

    // 2) criar hash
    const password_hash = await hashPassword(password);

    // 3) inserir user local
    const { error: insErr } = await supabaseAdmin.from('auth_local_users')
      .insert({ email, password_hash });
    if (insErr) {
      return NextResponse.json({ error: 'Falha ao criar utilizador.' }, { status: 500 });
    }

    // 4) upsert do perfil (mantém consistência com tua app)
    const { error: upErr } = await supabaseAdmin
      .from('profiles')
      .upsert({ email, name: name ?? null, role }, { onConflict: 'email' });
    if (upErr) {
      return NextResponse.json({ error: 'Falha ao criar perfil.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro inesperado.' }, { status: 500 });
  }
}
