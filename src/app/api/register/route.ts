// src/app/api/push/register/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint) return new NextResponse('Bad Request', { status: 400 });

  const { endpoint, keys } = sub;
  const p256dh = keys?.p256dh ?? null;
  const auth = keys?.auth ?? null;

  const sb = createServerClient();
  await sb
    .from('push_subscriptions')
    .upsert({ user_id: user.id, endpoint, p256dh, auth }, { onConflict: 'endpoint' });

  return NextResponse.json({ ok: true });
}
