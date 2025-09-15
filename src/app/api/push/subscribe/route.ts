import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

type WebPushSub = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const sessionUser = (session as any)?.user;
  if (!sessionUser?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = (await req.json().catch(() => null)) as WebPushSub | null;
  if (!payload?.endpoint) {
    return NextResponse.json({ ok: false, error: 'Missing endpoint' }, { status: 400 });
  }

  const sb = createServerClient();
  const { error } = await sb
    .from('push_subscriptions')
    .upsert(
      [
        {
          user_id: sessionUser.id,
          endpoint: payload.endpoint,
          p256dh: payload.keys?.p256dh ?? null,
          auth: payload.keys?.auth ?? null,
          created_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id,endpoint' },
    );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
