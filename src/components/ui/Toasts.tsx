// src/components/ui/Toasts.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Alert = {
  id?: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // ms
};

type Ctx = {
  items: Alert[];
  push: (a: Alert) => void;
  dismiss: (id: string) => void;
};

const Ctx = createContext<Ctx | null>(null);

/** Hook seguro: devolve no-ops se não houver provider (evita “useToast must be used inside …”). */
export function useToasts(): Ctx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      items: [],
      push: (a: Alert) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent<Alert>('app:toast', { detail: a }));
        }
      },
      dismiss: () => {},
    };
  }
  return ctx;
}

/** Helper global para disparar toasts a partir de qualquer sítio (incl. fora do React). */
export function showToast(a: Alert) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<Alert>('app:toast', { detail: a }));
  }
}

export default function ToastsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Alert[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((a: Alert) => {
    const id = a.id ?? Math.random().toString(36).slice(2);
    const toast = { ...a, id };
    setItems((prev) => [toast, ...prev].slice(0, 5));
    const ms = a.duration ?? 3500;
    window.setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Alert>;
      if (ce?.detail) push(ce.detail);
    };
    window.addEventListener('app:toast', handler as any);
    return () => window.removeEventListener('app:toast', handler as any);
  }, [push]);

  return (
    <Ctx.Provider value={{ items, push, dismiss }}>
      {children}
      <div className="toasts-root" aria-live="polite"
           style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 10000 }}>
        {items.map((t) => (
          <div key={t.id}
               className={`toast toast--${t.type ?? 'info'}`}
               role="status"
               style={{
                 border: '1px solid var(--border)',
                 background: 'var(--card-bg)',
                 color: 'var(--text)',
                 borderRadius: 12,
                 padding: 12,
                 minWidth: 280,
                 boxShadow: '0 10px 30px rgba(0,0,0,.15)',
               }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
                {!!t.description && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t.description}</div>}
              </div>
              <button className="btn icon" aria-label="Fechar" onClick={() => dismiss(t.id!)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
