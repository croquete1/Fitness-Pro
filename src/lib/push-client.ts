// src/lib/push-client.ts
'use client';

// Pequeno util para a VAPID public key (base64url → Uint8Array)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof atob === 'function' ? atob(base64) : '';
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Ok = { ok: true };
type Fail = { ok: false; reason: string };

const SW_URL = '/sw.js';

// Verifica suporte do browser (e de Notification)
function isSupported() {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Garante um registration do service worker (no escopo /sw.js)
async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isSupported()) return null;

  // Tenta obter um registration existente para o ficheiro do SW
  let reg = await navigator.serviceWorker.getRegistration(SW_URL);
  if (reg) return reg;

  // Caso não exista, regista e aguarda
  try {
    reg = await navigator.serviceWorker.register(SW_URL);
    // Espera o estado "ready" (evita races ao chamar pushManager)
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

// Sobe a subscrição para o servidor
async function pushRegisterToServer(subscription: PushSubscription): Promise<boolean> {
  try {
    const res = await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Remove a subscrição no servidor (tenta DELETE, faz fallback para POST /unregister)
async function pushUnregisterOnServer(subscription: PushSubscription): Promise<void> {
  try {
    const res = await fetch('/api/push/register', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    if (res.ok) return;
  } catch {
    // ignora e tenta fallback
  }
  try {
    await fetch('/api/push/unregister', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  } catch {
    // silencioso — o unsubscribe local continua
  }
}

/**
 * Ativa Web Push:
 * - regista o SW (se necessário)
 * - pede permissão de notificação
 * - cria ou reaproveita a assinatura
 * - envia a assinatura para o servidor
 */
export async function enablePush(): Promise<Ok | Fail> {
  if (!isSupported()) return { ok: false, reason: 'unsupported' };

  // Pede permissão caso ainda não tenha sido concedida/negada
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission().catch(() => 'denied');
    if (perm !== 'granted') return { ok: false, reason: 'denied' };
  }
  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  const reg = await getRegistration();
  if (!reg) return { ok: false, reason: 'sw-register-failed' };

  // Reaproveita a subscrição se existir
  let sub = await reg.pushManager.getSubscription();

  // Caso não exista, tenta criar com a VAPID public key
  if (!sub) {
    const pub = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
    if (!pub) return { ok: false, reason: 'no-public-key' };

    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pub),
      });
    } catch (e) {
      return { ok: false, reason: 'subscribe-failed' };
    }
  }

  // Regista no servidor
  const uploaded = await pushRegisterToServer(sub);
  if (!uploaded) return { ok: false, reason: 'server-register-failed' };

  return { ok: true };
}

/**
 * Desativa Web Push:
 * - avisa o servidor para remover o endpoint
 * - faz unsubscribe local
 */
export async function disablePush(): Promise<Ok | Fail> {
  if (!isSupported()) return { ok: false, reason: 'unsupported' };
  const reg = await getRegistration();
  if (!reg) return { ok: false, reason: 'sw-missing' };

  const sub = await reg.pushManager.getSubscription();
  if (!sub) return { ok: true }; // já não há subscrição

  try {
    await pushUnregisterOnServer(sub);
  } catch {
    // Mesmo que o servidor falhe, continuamos com o unsubscribe local
  }

  try {
    const ok = await sub.unsubscribe();
    if (!ok) {
      // Alguns browsers retornam false mesmo removendo; consideramos OK
    }
  } catch {
    // Ignora erros do browser
  }

  return { ok: true };
}

/**
 * Estado atual do push no cliente.
 * Retorna:
 *  - 'enabled' quando há permissão "granted" e uma subscrição ativa
 *  - 'disabled' caso contrário
 */
export async function getPushStatus(): Promise<'enabled' | 'disabled'> {
  if (!isSupported()) return 'disabled';
  if (Notification.permission !== 'granted') return 'disabled';

  const reg = await getRegistration();
  if (!reg) return 'disabled';

  const sub = await reg.pushManager.getSubscription();
  return sub ? 'enabled' : 'disabled';
}

/* =================== Compatibilidade com código antigo =================== */
/** @deprecated Usa enablePush() */
export async function registerPush(): Promise<Ok | Fail> {
  return enablePush();
}
