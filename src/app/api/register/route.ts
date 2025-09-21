import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabaseServer';

const schema = z.object({
  name: z.string().min(1).max(120),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.-]+$/i).optional().nullable(),
  email: z.string().email(),
  role: z.enum(['CLIENT', 'PT']).default('CLIENT'),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos' }, { status: 400 });
  }

  const { name, username, email, role } = parsed.data;
  const em = email.toLowerCase().trim();
  const sb = createServerClient();

  // já existe utilizador?
  const { data: existingUser } = await sb
    .from('users')
    .select('id')
    .ilike('email', em)
    .maybeSingle();
  if (existingUser) {
    return NextResponse.json({ ok: false, error: 'Email já registado' }, { status: 409 });
  }

  // já existe pedido?
  const { data: existingReq } = await sb
    .from('register_requests')
    .select('id')
    .ilike('email', em)
    .maybeSingle();
  if (existingReq) {
    return NextResponse.json({ ok: true, already: true });
  }

  const { error } = await sb.from('register_requests').insert({
    name,
    username,
    email: em,
    role,
    status: 'PENDING',
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Falha a criar pedido' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
