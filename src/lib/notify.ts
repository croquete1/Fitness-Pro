// src/lib/notify.ts
import { createServerClient } from '@/lib/supabaseServer';
import { ensureWebPush, webpush } from '@/lib/webpush';

type NotifyTarget = { userId: string };
type NotifyInput = { title: string; body?: string; url?: string };

export async function notifyUsers(targets: NotifyTarget[], input: NotifyInput) {
  const sb = createServerClient();

  // 1) Registo em BD (notifications)
  const rows = targets.map((t) => ({
    user_id: t.userId,
    title: input.title,
    body: input.body ?? null,
    href: input.url ?? null,
    read: false,
  }));
  const { error: insErr } = await sb.from('notifications').insert(rows);
  if (insErr) throw new Error(insErr.message);

  // 2) Envio push (se VAPID estiver configurado)
  const cfg = ensureWebPush();
  if (!cfg.ok) return { ok: true, push: 0 };

  const payload = JSON.stringify({
    title: input.title,
    body: input.body ?? '',
    url: input.url ?? '/dashboard',
  });

  // obter subs distintas dos alvos
  const userIds = Array.from(new Set(targets.map((t) => t.userId)));
  const { data: subs } = await sb
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', userIds);

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
  return { ok: true, push: sent };
}
