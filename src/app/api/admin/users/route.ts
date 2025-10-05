import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type DBUser = Record<string, any>;

function normalizeRole(v: any): string {
  const s = String(v ?? '').toLowerCase();
  if (!s) return '';
  if (['adm', 'administrator'].includes(s)) return 'admin';
  if (['pt', 'trainer', 'coach', 'personal'].includes(s)) return 'pt';
  if (['client', 'user', 'aluno', 'utente'].includes(s)) return 'client';
  return s;
}

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const role = normalizeRole(searchParams.get('role'));

  const { data, error } = await sb.from('users').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rowsAll = (data ?? []) as DBUser[];

  const mapped = rowsAll.map((u) => ({
    id: String(u.id),
    name: u.name ?? u.full_name ?? null,
    email: u.email ?? null,
    role: u.role ?? u.type ?? null,
    status: u.status ?? null,
    approved: Boolean(u.approved ?? u.is_approved ?? false),
    active: Boolean(u.active ?? u.is_active ?? false),
    created_at: u.created_at ?? u.createdAt ?? null,
  }));

  const filtered = mapped.filter((r) => {
    const okRole = role ? normalizeRole(r.role) === role : true;
    const okQ = q
      ? (String(r.name ?? '').toLowerCase().includes(q) ||
         String(r.email ?? '').toLowerCase().includes(q))
      : true;
    return okRole && okQ;
  });

  const count = filtered.length;
  const from = (page - 1) * pageSize;
  const to = Math.min(from + pageSize, count);
  const pageRows = filtered.slice(from, to);

  return NextResponse.json({ rows: pageRows, count });
}
