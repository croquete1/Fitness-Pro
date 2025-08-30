'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms (default 3500). 0 = não auto-dispensa
};

type ToastAPI = {
  show: (t: Omit<ToastItem, 'id'>) => void;
  success: (message: string, opts?: Omit<ToastItem, 'id' | 'type'>) => void;
  error: (message: string, opts?: Omit<ToastItem, 'id' | 'type'>) => void;
  info: (message: string, opts?: Omit<ToastItem, 'id' | 'type'>) => void;
  warning: (message: string, opts?: Omit<ToastItem, 'id' | 'type'>) => void;
  dismiss: (id: string) => void;
};

const Ctx = createContext<ToastAPI | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((s) => s.filter((i) => i.id !== id));
  }, []);

  const show = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const entry: ToastItem = { id, duration: 3500, ...t };
    setItems((s) => [...s, entry]);
    if (entry.duration && entry.duration > 0) {
      setTimeout(() => dismiss(id), entry.duration);
    }
  }, [dismiss]);

  const api: ToastAPI = {
    show,
    success: (message, opts) => show({ message, type: 'success', ...opts }),
    error:   (message, opts) => show({ message, type: 'error', ...opts }),
    info:    (message, opts) => show({ message, type: 'info', ...opts }),
    warning: (message, opts) => show({ message, type: 'warning', ...opts }),
    dismiss,
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <button
            key={t.id}
            className={`toast toast--${t.type ?? 'info'}`}
            onClick={() => dismiss(t.id)}
            title="Fechar"
          >
            {t.title && <div className="toast-title">{t.title}</div>}
            <div className="toast-msg">{t.message}</div>
          </button>
        ))}
      </div>
    </Ctx.Provider>
  );
}
