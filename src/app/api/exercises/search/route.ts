import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();

  const s = supabaseAdmin();
  let query = s.from('exercises').select('id, name, muscle_group, equipment, difficulty');
  if (q) {
    // ILIKE em name, muscle_group e equipment
    query = query.or(`name.ilike.%${q}%,muscle_group.ilike.%${q}%,equipment.ilike.%${q}%`);
  }
  const { data, error } = await query.order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((x) => ({
    id: x.id,
    name: x.name,
    muscleGroup: x.muscle_group,
    equipment: x.equipment,
    difficulty: x.difficulty,
  }));
  return NextResponse.json({ items });
}
