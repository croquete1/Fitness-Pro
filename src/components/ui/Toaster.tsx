'use client';
import * as React from 'react';

type Toast = { id: string; text: string; ttl: number };
const TOAST_EVENT = 'app:toast';

export function toast(text: string, ttl = 3000) {
  if (typeof window === 'undefined') return;
  const ev = new CustomEvent(TOAST_EVENT, { detail: { text, ttl } });
  window.dispatchEvent(ev);
}

/** Hook compatível com `import { useToast } from "@/components/ui/Toaster"` */
export function useToast() {
  return React.useCallback((text: string, ttl = 3000) => toast(text, ttl), []);
}

export default function Toaster() {
  const [list, setList] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const onToast = (e: any) => {
      const id =
        (globalThis.crypto && 'randomUUID' in globalThis.crypto
          ? (globalThis.crypto as Crypto).randomUUID()
          : `t-${Math.random().toString(36).slice(2)}`);
      const t: Toast = { id, text: e.detail.text, ttl: e.detail.ttl ?? 3000 };
      setList(prev => [...prev, t]);
      setTimeout(() => setList(prev => prev.filter(x => x.id !== t.id)), t.ttl);
    };
    window.addEventListener(TOAST_EVENT as any, onToast);
    return () => window.removeEventListener(TOAST_EVENT as any, onToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {list.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-lg px-3 py-2 text-sm bg-neutral-900 text-white shadow-lg border border-white/10"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
