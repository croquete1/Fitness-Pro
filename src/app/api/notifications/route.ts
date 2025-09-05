// src/app/api/notifications/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') ?? 'unread') as 'all'|'unread'|'read';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));
  const from = (page - 1) * pageSize;

  const sb = createServerClient();
  let q = sb
    .from('notifications')
    .select('id,title,body,href,created_at,read', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (status === 'unread') q = q.eq('read', false);
  if (status === 'read') q = q.eq('read', true);

  const { data, error, count } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ items: data ?? [], total: count ?? 0, page, pageSize });
}
