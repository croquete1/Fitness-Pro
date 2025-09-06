import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id,title,body,link,created_at,read,type')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
