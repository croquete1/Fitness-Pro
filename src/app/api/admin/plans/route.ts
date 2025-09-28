import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .insert({ title: 'Novo plano 🗂️' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    id: String(data.id),
    title: data.title ?? null,
    updated_at: data.updated_at ?? data.created_at ?? null,
  });
}