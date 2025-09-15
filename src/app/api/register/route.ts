import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const data = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; role?: string }
    | null;

  if (!data?.email) {
    return NextResponse.json({ ok: false, error: 'Email é obrigatório' }, { status: 400 });
  }

  // Guarda pedido de registo para aprovação (ajusta para a tua tabela real)
  const { error } = await sb.from('register_requests').insert([
    {
      name: data.name ?? null,
      email: data.email,
      role: data.role ?? 'CLIENT',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
