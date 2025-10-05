import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  const role = (searchParams.get('role') || '').toLowerCase(); // 'trainer' | 'pt' | 'client'
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const id = searchParams.get('id') || null;

  // Base: tabela 'users'
  let query = sb.from('users').select('id, name, full_name, email, role').limit(50);

  if (id) {
    const one = await query.eq('id', id).single();
    if (one.error || !one.data) return NextResponse.json({ rows: [] });
    const r = one.data as any;
    return NextResponse.json({
      rows: [{ id: String(r.id), name: r.name ?? r.full_name ?? null, email: r.email ?? null, role: r.role ?? null }],
    });
  }

  if (role) query = query.ilike('role', `%${role}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ rows: [], error: error.message }, { status: 400 });

  const mapped = (data ?? [])
    .map((r: any) => ({
      id: String(r.id),
      name: r.name ?? r.full_name ?? null,
      email: r.email ?? null,
      role: r.role ?? null,
    }))
    .filter((r) => {
      if (!q) return true;
      return String(r.name ?? '').toLowerCase().includes(q) || String(r.email ?? '').toLowerCase().includes(q);
    });

  return NextResponse.json({ rows: mapped.slice(0, 50) });
}
