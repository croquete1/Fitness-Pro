// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const zBody = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  username: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9._]{3,30}$/i, 'Username inválido')
    .optional()
    .nullable(),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['CLIENT', 'PT', 'TRAINER', 'ADMIN']).optional().default('CLIENT'),
});

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = zBody.parse(json);

    const sb = supabaseAdmin();
    const email = body.email.toLowerCase();
    const username = body.username?.toLowerCase().trim() || null;

    // 1) Duplicados: users (ativos) por email
    {
      const { data, error } = await sb
        .from('users')
        .select('id')
        .ilike('email', email)
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        return NextResponse.json(
          { message: 'Este email já se encontra registado.' },
          { status: 409 }
        );
      }
    }

    // 2) Duplicados: pedidos pendentes (register_requests) por email
    {
      const { data, error } = await sb
        .from('register_requests')
        .select('id')
        .ilike('email', email)
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        return NextResponse.json(
          { message: 'Já existe um pedido de registo em análise para este email.' },
          { status: 409 }
        );
      }
    }

    // 3) Username (se fornecido): unique em users e em pedidos
    if (username) {
      const u1 = await sb.from('users').select('id').ilike('username', username).limit(1);
      if (u1.error) throw u1.error;
      if (u1.data && u1.data.length > 0) {
        return NextResponse.json(
          { message: 'Nome de utilizador já em uso.' },
          { status: 409 }
        );
      }
      const u2 = await sb.from('register_requests').select('id').ilike('username', username).limit(1);
      if (u2.error) throw u2.error;
      if (u2.data && u2.data.length > 0) {
        return NextResponse.json(
          { message: 'Nome de utilizador já em uso (pedido pendente).' },
          { status: 409 }
        );
      }
    }

    // 4) Inserir pedido
    const payload = {
      name: body.name ?? null,
      username,
      email,
      role: body.role ?? 'CLIENT',
      created_at: new Date().toISOString(),
      status: 'PENDING',
    };

    const ins = await sb.from('register_requests').insert(payload).select('id').single();
    if (ins.error) throw ins.error;

    return NextResponse.json({ ok: true, id: ins.data.id });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ message: 'Dados inválidos', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ message: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
