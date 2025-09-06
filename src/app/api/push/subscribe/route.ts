import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = await req.json().catch(() => null);
  if (!payload?.endpoint || !payload?.keys) return new NextResponse('Bad Request', { status: 400 });

  const sb = createServerClient();
  await sb.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: payload.endpoint,
    p256dh: payload.keys.p256dh,
    auth: payload.keys.auth,
    user_agent: req.headers.get('user-agent') || null
  }, { onConflict: 'endpoint' });

  return NextResponse.json({ ok: true as const });
}
