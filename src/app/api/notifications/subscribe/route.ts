// src/app/api/notifications/subscribe/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sub = body?.subscription;

  const endpoint = sub?.endpoint as string | undefined;
  const p256dh = sub?.keys?.p256dh as string | undefined;
  const auth = sub?.keys?.auth as string | undefined;
  if (!endpoint || !p256dh || !auth) return new NextResponse('Bad Request', { status: 400 });

  const sb = createServerClient();

  // Tabela: push_subscriptions (ver SQL mais abaixo)
  const { error } = await sb
    .from('push_subscriptions')
    .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: 'endpoint' });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = body?.endpoint as string | undefined;
  if (!endpoint) return new NextResponse('Bad Request', { status: 400 });

  const sb = createServerClient();
  await sb.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userId);
  return NextResponse.json({ ok: true });
}
