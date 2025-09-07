import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return NextResponse.json({ count: 0 });

  const sb = createServerClient();
  const { count } = await sb
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('read', false);

  return NextResponse.json({ count: count ?? 0 });
}
