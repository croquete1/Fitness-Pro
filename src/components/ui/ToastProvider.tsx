'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastKind = 'ok' | 'err' | 'info';
export type Toast = { id: string; text: string; kind?: ToastKind; ms?: number };

type Ctx = {
  push: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider/>');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, kind: 'ok', ms: 3000, ...t };
    setItems((xs) => [...xs, toast]);
    // auto-dismiss
    const ms = toast.ms ?? 3000;
    if (ms > 0) setTimeout(() => remove(id), ms);
  }, [remove]);

  const value = useMemo<Ctx>(() => ({ push, remove }), [push, remove]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* Viewport */}
      <div className="fixed right-4 top-4 z-[10000] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-3 py-2 shadow-lg text-white ${
              t.kind === 'err' ? 'bg-red-600' : t.kind === 'info' ? 'bg-blue-600' : 'bg-green-600'
            }`}
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
