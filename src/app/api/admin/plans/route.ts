import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const { data, error } = await sb
    .from('training_plans')
    .insert({ title: body?.title ?? 'Novo plano' })
    .select('id, title, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    id: String(data.id),
    title: data.title ?? null,
    created_at: data.created_at ?? null,
    updated_at: data.updated_at ?? null,
  });
}
