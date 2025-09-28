// src/app/api/admin/exercises/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const upd: any = {
    name: 'name' in body ? (body.name ?? null) : undefined,
    muscle: 'muscle' in body ? (body.muscle ?? null) : undefined,
    equipment: 'equipment' in body ? (body.equipment ?? null) : undefined,
    updated_at: new Date().toISOString(),
  };
  Object.keys(upd).forEach((k) => upd[k] === undefined && delete upd[k]);

  const { data, error } = await sb
    .from('exercises')
    .update(upd)
    .eq('id', params.id)
    .select('id, name, muscle, equipment, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// cria exercício básico
export async function POST() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .insert({ name: 'Novo exercício 💪' })
    .select('id, name, muscle, equipment, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
