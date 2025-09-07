// src/lib/pushClient.ts

/**
 * Utilitários de Web Push no cliente:
 *  - enablePush(): pede permissão, regista SW e envia subscrição para a API
 *  - disablePush(): cancela a subscrição localmente e tenta informar a API
 */

type Result = { ok: true } | { ok: false; reason: string };

function base64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function registerSW(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker não suportado');
  }
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return await navigator.serviceWorker.register('/service-worker.js');
  }
}

async function getAnyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) return reg;
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs?.length) return regs[0];
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

/** Ativa notificações push */
export async function enablePush(): Promise<Result> {
  try {
    if (typeof window === 'undefined') return { ok: false, reason: 'Só disponível no cliente' };
    if (!('Notification' in window)) return { ok: false, reason: 'Notificações não suportadas' };

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    if (!vapid) return { ok: false, reason: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY em falta' };

    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'Permissão negada' };

    const reg = (await getAnyRegistration()) ?? (await registerSW());

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(vapid),
      });
    }

    const payload = sub.toJSON();
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, reason: `Falha no registo (${res.status}) ${text}`.trim() };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

/** Desativa notificações push (idempotente) */
export async function disablePush(): Promise<Result> {
  try {
    if (typeof window === 'undefined') return { ok: false, reason: 'Só disponível no cliente' };
    if (!('serviceWorker' in navigator)) return { ok: false, reason: 'Service Worker não suportado' };

    const reg = await getAnyRegistration();
    if (!reg) return { ok: true }; // nada a fazer

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { ok: true }; // já está desligado

    const endpoint = sub.endpoint;

    // Tenta informar o backend (ignora se a rota não existir)
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      // ignorar erros/404 da rota
    }

    // Cancela localmente
    await sub.unsubscribe();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

/** (Opcional) Estado atual — útil para UI */
export async function getPushStatus(): Promise<'enabled' | 'disabled' | 'unsupported'> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const reg = await getAnyRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub ? 'enabled' : 'disabled';
  } catch {
    return 'disabled';
  }
}
