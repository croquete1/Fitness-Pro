// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/validation/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/hash';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Campos inválidos.' }, { status: 400 });

  const { name, email, password } = parsed.data;

  const { data: exists } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (exists) return NextResponse.json({ error: 'Email já registado.' }, { status: 409 });

  const password_hash = await hashPassword(password);

  // ⚠️ Inserimos só colunas garantidas: email, password_hash (+ name se existir no teu schema)
  const payload: any = { email, password_hash };
  if (typeof name !== 'undefined') payload.name = name;

  const { error } = await supabaseAdmin.from('users').insert(payload);
  if (error) return NextResponse.json({ error: 'Falha a criar utilizador.' }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
