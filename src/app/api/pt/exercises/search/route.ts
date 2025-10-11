import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const sb = createServerClient();
  let query = sb
    .from('exercises')
    .select('id,name,description,muscle_group,equipment,difficulty,is_published,is_global')
    .eq('is_global', true)
    .eq('is_published', true)
    .limit(50);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,muscle_group.ilike.%${q}%,equipment.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}
