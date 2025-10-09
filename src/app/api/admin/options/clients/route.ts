import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || '20');

  const sb = createServerClient();

  const { data, error } = await sb
    .from('users')
    .select('id,name,email,role')
    .or(q ? `name.ilike.%${q}%,email.ilike.%${q}%` : '')
    .in('role', ['CLIENT'])
    .limit(limit);
  if (error) return NextResponse.json([], { status: 200 });

  const options = (data ?? []).map((u: any) => ({
    id: String(u.id),
    label: String(u.name || u.email || u.id),
  }));

  return NextResponse.json(options);
}
