import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = await req.json().catch(() => null);
  const endpoint = payload?.endpoint;
  if (!endpoint) return new NextResponse('Bad Request', { status: 400 });

  const sb = createServerClient();
  await sb.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint);

  return NextResponse.json({ ok: true as const });
}
