// src/lib/webpush.ts
import webpushLib from 'web-push';

export const webpush = webpushLib;

/** Só configura quando for chamado (evita erro em build) */
export function ensureWebPush():
  | { ok: true }
  | { ok: false; reason: string } {
  const pub = process.env.WEB_PUSH_PUBLIC_KEY;
  const priv = process.env.WEB_PUSH_PRIVATE_KEY;
  const mail = process.env.WEB_PUSH_CONTACT_EMAIL;
  if (!pub || !priv || !mail) {
    return { ok: false, reason: 'Missing WEB_PUSH_* envs' };
  }
  webpush.setVapidDetails(`mailto:${mail}`, pub, priv);
  return { ok: true };
}
