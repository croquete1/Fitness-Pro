// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/validation/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/hash';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Campos inválidos.' }, { status: 400 });
  }
  const { name, email, password, role = 'CLIENT' } = parsed.data;

  // já existe?
  const { data: exists } = await supabaseAdmin
    .from('auth_local_users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (exists) return NextResponse.json({ error: 'Email já registado.' }, { status: 409 });

  const password_hash = await hashPassword(password);

  // credencial + perfil (upsert)
  const { error: e1 } = await supabaseAdmin
    .from('auth_local_users')
    .insert({ email, password_hash });
  if (e1) return NextResponse.json({ error: 'Falha a criar credencial.' }, { status: 500 });

  const { error: e2 } = await supabaseAdmin
    .from('profiles')
    .upsert({ email, name: name ?? null, role }, { onConflict: 'email' });
  if (e2) return NextResponse.json({ error: 'Falha a sincronizar perfil.' }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
