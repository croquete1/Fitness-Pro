import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Check = { name: string; ok: boolean; error?: string };

export async function GET() {
  const sb = createServerClient();

  const checks: Check[] = [];

  async function headCount(table: string, filters?: (q: any) => any) {
    try {
      let q = sb.from(table).select('*', { count: 'exact', head: true });
      if (filters) q = filters(q);
      const { error } = await q;
      if (error) throw error;
      checks.push({ name: `table:${table}`, ok: true });
    } catch (e: any) {
      checks.push({ name: `table:${table}`, ok: false, error: e?.message || String(e) });
    }
  }

  // Admin
  await headCount('approvals', (q) => q.eq('status', 'pending'));
  await headCount('notifications', (q) => q.eq('read', false));

  // Client (colunas específicas)
  await headCount('messages', (q) => q.eq('read', false));
  await headCount('notifications', (q) => q.eq('read', false));

  const ok = checks.every((c) => c.ok);
  return NextResponse.json({ ok, checks });
}
