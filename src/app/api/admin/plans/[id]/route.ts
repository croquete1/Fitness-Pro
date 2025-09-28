// src/app/api/admin/plans/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const upd: any = {
    title: 'title' in body ? (body.title ?? null) : undefined,
    updated_at: new Date().toISOString(),
  };
  Object.keys(upd).forEach((k) => upd[k] === undefined && delete upd[k]);

  const { data, error } = await sb
    .from('training_plans')
    .update(upd)
    .eq('id', params.id)
    .select('id, title, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// cria plano simples
export async function POST() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .insert({ title: 'Novo plano 🗂️' })
    .select('id, title, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
