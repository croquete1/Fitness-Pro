// src/app/api/notifications/send/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole, isAdmin } from '@/lib/roles';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Payload = {
  title: string;
  body?: string;
  href?: string;
  userId?: string;
  role?: 'ADMIN' | 'PT' | 'CLIENT';
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((session.user as any).role);
  if (!role) return new NextResponse('Forbidden', { status: 403 });

  let body: Payload;
  try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }

  const supabase = supabaseAdmin();

  // 1) Persistir notificação na tabela notifications (para dropdown)
  const target_user_id = isAdmin(role) ? (body.userId ?? null) : String(session.user.id);
  const target_role = isAdmin(role) && !body.userId && body.role ? (body.role === 'PT' ? 'TRAINER' : body.role) : null;

  const { data: notif, error: errNotif } = await supabase
    .from('notifications')
    .insert({
      title: body.title,
      body: body.body ?? null,
      href: body.href ?? null,
      target_user_id,
      target_role,
    } as any)
    .select('id')
    .single();

  if (errNotif) return new NextResponse(errNotif.message, { status: 500 });

  // 2) Buscar subscrições destino
  let subsRows: { endpoint: string; p256dh: string; auth: string }[] = [];

  if (isAdmin(role) && (body.userId || body.role)) {
    if (body.userId) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint,p256dh,auth')
        .eq('user_id', body.userId);
      if (error) return new NextResponse(error.message, { status: 500 });
      subsRows = data ?? [];
    } else if (body.role) {
      const dbRole = body.role === 'PT' ? 'TRAINER' : body.role;
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint,p256dh,auth')
        .eq('role', dbRole);
      if (error) return new NextResponse(error.message, { status: 500 });
      subsRows = data ?? [];
    }
  } else {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint,p256dh,auth')
      .eq('user_id', String(session.user.id));
    if (error) return new NextResponse(error.message, { status: 500 });
    subsRows = data ?? [];
  }

  // 3) Enviar push
  const payload = JSON.stringify({
    title: body.title,
    body: body.body ?? '',
    href: body.href ?? '/dashboard',
  });

  const deadEndpoints: string[] = [];
  await Promise.all(
    subsRows.map(async (r) => {
      try {
        await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } } as any, payload);
      } catch (e: any) {
        const status = e?.statusCode || e?.status || 0;
        if (status === 404 || status === 410) deadEndpoints.push(r.endpoint);
      }
    })
  );

  if (deadEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', deadEndpoints);
  }

  return NextResponse.json({ ok: true, id: notif?.id, sent: subsRows.length, cleaned: deadEndpoints.length });
}
