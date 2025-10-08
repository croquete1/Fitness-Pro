import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const sb = createServerClient();

  async function count(table: string, where?: [string, string]) {
    let q = sb.from(table).select('id', { count: 'exact', head: true });
    if (where) q = q.eq(where[0], where[1]);
    const { count: c, error } = await q;
    if (error) throw new Error(error.message);
    return c ?? 0;
  }

  async function tryMany(list: { table: string; where?: [string, string] }[]) {
    for (const item of list) {
      try { return await count(item.table, item.where); } catch {}
    }
    return 0;
  }

  const approvalsCount = await tryMany([
    { table: 'approvals', where: ['status', 'pending'] },
    { table: 'user_approvals', where: ['status', 'pending'] },
  ]);

  const notificationsCount = await tryMany([
    { table: 'notifications', where: ['read', 'false'] },
    { table: 'admin_notifications', where: ['is_read', 'false'] },
  ]);

  return NextResponse.json({ approvalsCount, notificationsCount });
}
