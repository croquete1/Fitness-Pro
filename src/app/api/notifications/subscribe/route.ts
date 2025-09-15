// src/app/api/notifications/subscribe/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

type BrowserSubscription = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
  device?: string | null;
};

export async function POST(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  let sub: BrowserSubscription;
  try {
    sub = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!sub?.endpoint || typeof sub.endpoint !== 'string') {
    return NextResponse.json({ ok: false, error: 'endpoint_required' }, { status: 400 });
  }

  const sb = createServerClient();
  const ua = req.headers.get('user-agent') ?? null;

  try {
    // Tabela esperada: push_subscriptions (endpoint UNIQUE)
    const { data, error } = await sb
      .from('push_subscriptions' as any)
      .upsert(
        {
          user_id: me.id,
          endpoint: sub.endpoint,
          p256dh: sub.keys?.p256dh ?? null,
          auth: sub.keys?.auth ?? null,
          user_agent: ua,
          device: sub.device ?? null,
        },
        { onConflict: 'endpoint' }
      )
      .select('id')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'upsert_failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  // Aceita endpoint via query (?endpoint=...) ou body JSON { endpoint }
  const url = new URL(req.url);
  const endpointFromQuery = url.searchParams.get('endpoint');
  let endpoint = endpointFromQuery;
  if (!endpoint) {
    try {
      const b = (await req.json()) as { endpoint?: string };
      endpoint = b?.endpoint ?? null;
    } catch {
      // ignore
    }
  }
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: 'endpoint_required' }, { status: 400 });
  }

  const sb = createServerClient();
  try {
    const { error } = await sb
      .from('push_subscriptions' as any)
      .delete()
      .eq('user_id', me.id)
      .eq('endpoint', endpoint);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'delete_failed' },
      { status: 500 }
    );
  }
}
