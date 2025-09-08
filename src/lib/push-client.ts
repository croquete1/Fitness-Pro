// src/lib/push-client.ts
'use client';

/**
 * Util: converte VAPID public key (base64url) para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type PushResult =
  | { ok: true }
  | { ok: false; reason: string };

const SUPPORTS =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration | null> {
  if (!SUPPORTS) return null;
  try {
    // tenta obter um SW já registado para /sw.js
    const current = await navigator.serviceWorker.getRegistration('/sw.js');
    if (current) return current;
    // regista um novo se não houver
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

/**
 * Regista push no browser + envia a subscrição para o backend.
 * Seguro para chamar múltiplas vezes (idempotente).
 */
export async function registerPush(): Promise<PushResult> {
  if (!SUPPORTS) return { ok: false, reason: 'unsupported' };

  try {
    const reg = await getOrRegisterSW();
    if (!reg) return { ok: false, reason: 'sw-failed' };

    // pede permissão se necessário
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return { ok: false, reason: 'denied' };
    }

    // obtém subscrição existente ou cria nova
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const pub = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
      if (!pub) return { ok: false, reason: 'no-public-key' };

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pub),
      });
    }

    // envia para o backend (ignora erros pontuais)
    try {
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sub),
        keepalive: true,
      });
    } catch {
      // mesmo que o backend falhe neste passo, a subscrição no browser ficou criada
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Cancela/limpa a subscrição de push no browser
 * e avisa o backend (se disponível). Idempotente.
 */
export async function unregisterPush(): Promise<PushResult> {
  if (!SUPPORTS) return { ok: false, reason: 'unsupported' };

  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return { ok: true }; // nada a fazer

    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      // avisa o backend mas não falha se der 404
      try {
        await fetch('/api/push/unregister', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
          keepalive: true,
        });
      } catch {
        /* ignora */
      }
      try {
        await sub.unsubscribe();
      } catch {
        /* ignora */
      }
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
