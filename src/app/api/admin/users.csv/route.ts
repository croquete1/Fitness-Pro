// src/app/api/admin/users.csv/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

// Evita cache estática no build
export const dynamic = 'force-dynamic';

function esc(v: unknown) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Aspas duplas e vírgulas precisam de escaping em CSV
  const q = s.replace(/"/g, '""');
  // Se tiver vírgula, aspas ou quebra de linha, envolve em aspas
  return /[",\n\r]/.test(q) ? `"${q}"` : q;
}

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  // 👇 ERA: const s = supabaseAdmin();
  const s = supabaseAdmin;

  // Seleciona um conjunto “seguro” de colunas (presentes na tua tabela)
  // Se quiseres mais (ex.: username, approved, status), adiciona quando já existirem no schema.
  const { data, error } = await s
    .from('users')
    .select('id,email,name,role,created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = ['id', 'email', 'name', 'role', 'created_at'];
  const rows = (data ?? []).map((u) => [
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at,
  ]);

  const csv = [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
      // Evita cache agressiva em edge/CDN
      'Cache-Control': 'no-store',
    },
  });
}
