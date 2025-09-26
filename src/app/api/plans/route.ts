// src/app/api/plans/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  // Ajusta o filtro ao teu schema (ex.: owner_id se guardares o id)
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('owner_email', session.user.email)
    .order('created_at', { ascending: false });

  if (error) {
    // caso a tabela não exista ou RLS bloqueie, devolvemos lista vazia (evita crash)
    return NextResponse.json({ items: [] });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(() => null) as { title?: string; notes?: string } | null;
  const title = body?.title?.trim();
  if (!title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert({
      title,
      notes: body?.notes ?? null,
      owner_email: session.user.email, // <— ajusta se usares owner_id
    })
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Falha ao criar plano' }, { status: 500 });
  return NextResponse.json({ ok: true, plan: data }, { status: 201 });
}
