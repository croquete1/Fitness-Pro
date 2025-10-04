import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const payload = {
    name: body?.name ?? 'Novo exercício',
    muscle: body?.muscle ?? null,
    equipment: body?.equipment ?? null,
  };

  const { data, error } = await sb.from('exercises').insert(payload).select('id, name, muscle, equipment, created_at, updated_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: String(data.id),
    name: data.name ?? null,
    muscle: data.muscle ?? null,
    equipment: data.equipment ?? null,
    created_at: data.created_at ?? null,
    updated_at: data.updated_at ?? null,
  });
}
