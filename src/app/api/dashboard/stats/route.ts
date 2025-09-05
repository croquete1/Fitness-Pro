// src/app/api/dashboard/stats/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type UiNotif = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  createdAt?: string;
  read?: boolean;
};

function appRoleToDbRole(app: 'ADMIN' | 'PT' | 'CLIENT') {
  return app === 'PT' ? 'TRAINER' : app;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get('limit') ?? '10');
  const limit = Math.min(Math.max(limitParam, 1), 50); // 1..50
  const cursor = searchParams.get('cursor'); // ISO created_at

  const userId = String(session.user.id);
  const appRole = toAppRole((session.user as any).role) ?? 'CLIENT';
  const dbRole = appRoleToDbRole(appRole);

  const supabase = supabaseAdmin();

  const or =
    `target_user_id.eq.${userId},and(target_role.eq.${dbRole},target_user_id.is.null),and(target_role.is.null,target_user_id.is.null)`;

  let q = supabase
    .from('notifications')
    .select('id,title,body,href,created_at', { count: 'exact' })
    .or(or)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) q = q.lt('created_at', cursor);

  const { data, error } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.created_at : null;

  // reads
  const ids = page.map((r: any) => r.id);
  let readSet = new Set<string>();
  if (ids.length) {
    const { data: reads, error: err2 } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId)
      .in('notification_id', ids);
    if (err2) return new NextResponse(err2.message, { status: 500 });
    readSet = new Set((reads ?? []).map((r: any) => r.notification_id));
  }

  const notifications: UiNotif[] = page.map((n: any) => ({
    id: n.id,
    title: n.title ?? undefined,
    body: n.body ?? null,
    link: n.href ?? null,
    createdAt: n.created_at ? new Date(n.created_at).toISOString() : undefined,
    read: readSet.has(n.id),
  }));

  return NextResponse.json({ notifications, nextCursor });
}
