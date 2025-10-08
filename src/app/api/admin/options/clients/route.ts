import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || '20');

  const sb = createServerClient();

  // 1) tentar em "users"
  let { data, error } = await sb
    .from('users')
    .select('id,name,email,role')
    .or(q ? `name.ilike.%${q}%,email.ilike.%${q}%` : '')
    .in('role', ['CLIENT'])
    .limit(limit);

  // 2) fallback: "profiles"
  if (error || !data || data.length === 0) {
    const r2 = await sb
      .from('profiles')
      .select('id,name,email,role')
      .or(q ? `name.ilike.%${q}%,email.ilike.%${q}%` : '')
      .in('role', ['CLIENT'])
      .limit(limit);
    data = r2.data || [];
  }

  const options = (data || []).map((u: any) => ({
    id: String(u.id),
    label: String(u.name || u.email || u.id),
  }));

  return NextResponse.json(options);
}
