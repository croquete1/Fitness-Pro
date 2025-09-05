// src/lib/pushClient.ts
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export async function enablePush(): Promise<{ ok: boolean; permission: NotificationPermission }> {
  if (typeof window === 'undefined') return { ok: false, permission: 'default' };
  if (!('serviceWorker' in navigator) || !('PushManager' in window))
    return { ok: false, permission: Notification.permission };

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, permission: perm };

  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!pub) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY em falta');

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pub),
    }));

  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });

  return { ok: true, permission: 'granted' };
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await fetch('/api/notifications/subscribe', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}
