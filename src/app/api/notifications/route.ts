import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const filter = url.searchParams.get('filter') || 'all'; // all | unread
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  const sb = createServerClient();
  let q = sb.from('notifications')
    .select('id,title,body,link,read,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filter === 'unread') q = q.eq('read', false);

  const { data, error } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}
