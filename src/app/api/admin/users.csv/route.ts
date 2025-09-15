import { NextResponse } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // <- cliente, não função

function toCsvRow(fields: Array<string | number | null | undefined>) {
  return fields
    .map((f) => `"${String(f ?? '').replace(/"/g, '""')}"`)
    .join(',');
}

export async function GET(): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = supabaseAdmin; // <- sem parêntesis

  const { data, error } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const header = ['id', 'name', 'email', 'role', 'status', 'created_at'];
  const rows = (data ?? []).map((u) =>
    toCsvRow([u.id, u.name, u.email, u.role, u.status, u.created_at]),
  );

  const body = [toCsvRow(header), ...rows].join('\r\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
