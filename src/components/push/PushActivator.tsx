'use client';
import * as React from 'react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || '';

function base64ToUint8Array(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushActivator() {
  const [supported, setSupported] = React.useState(false);
  const [enabled, setEnabled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const ok = typeof window !== 'undefined'
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window
      && !!PUBLIC_KEY;
    setSupported(ok);
    if (!ok) return;
    // já subscrito?
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const r = reg || await navigator.serviceWorker.register('/sw.js');
      const sub = await r.pushManager.getSubscription();
      setEnabled(!!sub && Notification.permission === 'granted');
    }).catch(() => {});
  }, []);

  const activate = async () => {
    if (busy || !supported) return;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setBusy(false); return; }
      const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/sw.js'));
      const exist = await reg.pushManager.getSubscription();
      const sub = exist || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(PUBLIC_KEY)
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sub)
      });
      setEnabled(true);
    } catch {}
    setBusy(false);
  };

  if (!supported || enabled) return null;

  return (
    <button className="btn chip" type="button" onClick={activate} aria-busy={busy}>
      {busy ? 'A ativar…' : '🔔 Ativar notificações'}
    </button>
  );
}
