// src/app/api/notifications/mark-all-read/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

function appRoleToDbRole(app: 'ADMIN' | 'PT' | 'CLIENT') {
  return app === 'PT' ? 'TRAINER' : app;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const userId = String(session.user.id);
  const appRole = toAppRole((session.user as any).role) ?? 'CLIENT';
  const dbRole = appRoleToDbRole(appRole);

  const supabase = supabaseAdmin();
  const or =
    `target_user_id.eq.${userId},and(target_role.eq.${dbRole},target_user_id.is.null),and(target_role.is.null,target_user_id.is.null)`;

  const pageSize = 500;
  let cursor: string | null = null;
  let total = 0;
  let loops = 0;

  while (loops < 10) { // segurança: até 5000 por chamada
    loops++;
    let q = supabase
      .from('notifications')
      .select('id,created_at')
      .or(or)
      .order('created_at', { ascending: false })
      .limit(pageSize);
    if (cursor) q = q.lt('created_at', cursor);
    const { data, error } = await q;
    if (error) return new NextResponse(error.message, { status: 500 });
    const rows = data ?? [];
    if (!rows.length) break;

    const ids = rows.map((r: any) => r.id);
    const upsertRows = ids.map((notification_id) => ({ user_id: userId, notification_id }));

    const { error: err2 } = await supabase
      .from('notification_reads')
      .upsert(upsertRows, { onConflict: 'user_id,notification_id' });
    if (err2) return new NextResponse(err2.message, { status: 500 });

    total += ids.length;
    cursor = rows[rows.length - 1].created_at;
    if (rows.length < pageSize) break;
  }

  return NextResponse.json({ ok: true, marked: total });
}
