import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson } from '@/lib/supabase/responses';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || '20');

  const sb = tryCreateServerClient();
  if (!sb) return supabaseFallbackJson({ rows: [] });

  let query = sb
    .from('users')
    .select('id,name,email,role')
    .in('role', ['CLIENT'])
    .limit(limit);
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await query;

  const primaryOptions = (data ?? []).map((u: any) => ({
    id: String(u.id),
    name: u.name ?? null,
    email: u.email ?? null,
    label: String(u.name || u.email || u.id),
  }));

  if (primaryOptions.length && !error) {
    return NextResponse.json({ rows: primaryOptions });
  }

  const { data: profiles } = await sb
    .from('profiles')
    .select('id,full_name,email,role')
    .eq('role', 'CLIENT')
    .limit(limit);
  const fallbackOptions = (profiles ?? []).map((p: any) => ({
    id: String(p.id),
    name: p.full_name ?? p.name ?? null,
    email: p.email ?? null,
    label: String(p.full_name || p.email || p.id),
  }));

  return NextResponse.json({ rows: fallbackOptions });
}
