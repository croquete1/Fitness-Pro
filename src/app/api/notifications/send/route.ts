// src/app/api/notifications/send/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { ensureWebPush, webpush } from '@/lib/webpush';

type Payload = {
  targetUserId?: string;
  title?: string;
  body?: string;
  url?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const cfg = ensureWebPush();
  if (!cfg.ok) {
    // ✅ narrow seguro sem erro TS
    const reason = 'reason' in cfg ? cfg.reason : 'Chaves VAPID em falta';
    return new NextResponse(`Push não configurado: ${reason}`, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const targetUserId = body.targetUserId || meId;

  const sb = createServerClient();
  const { data: subs, error } = await sb
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', targetUserId);

  if (error) return new NextResponse(error.message, { status: 500 });

  const payload = JSON.stringify({
    title: body.title || 'Fitness Pro',
    body: body.body || '',
    url: body.url || '/dashboard',
  });

  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any,
        payload
      );
      sent++;
    } catch (err: any) {
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await sb.from('push_subscriptions').delete().eq('id', s.id);
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
