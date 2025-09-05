// src/lib/webpush.ts
import webpush from 'web-push';

let configured = false;

export function ensureWebPush(): { ok: true } | { ok: false; reason: string } {
  if (configured) return { ok: true };

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT || 'mailto:support@example.com';

  if (!pub || !priv) {
    return { ok: false, reason: 'VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY em falta' };
  }
  try {
    webpush.setVapidDetails(contact, pub, priv);
    configured = true;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'Falha a configurar web-push' };
  }
}

export { webpush };
export const PUBLIC_VAPID_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '';
