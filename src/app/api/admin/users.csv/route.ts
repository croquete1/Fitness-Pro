// src/app/api/admin/users.csv/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin } from '@/lib/roles';

type Row = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

export async function GET() {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(toAppRole(me.user.role) ?? 'CLIENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const s = supabaseAdmin();
  const { data, error } = await s
    .from('users')
    .select('id,email,username,username_lower,name,role,status,created_at')
    .order('created_at', { ascending: true })
    .returns<Row[]>();

  if (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  const rows = data ?? [];
  const header = ['id', 'email', 'username', 'name', 'role', 'status', 'created_at'];

  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    header.join(','), // header
    ...rows.map(r =>
      [
        r.id,
        r.email,
        r.username ?? '',
        r.name ?? '',
        r.role ?? '',
        r.status ?? '',
        r.created_at ?? '',
      ].map(esc).join(',')
    ),
  ];

  // BOM para abrir bem no Excel
  const csv = '\ufeff' + lines.join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="users.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
