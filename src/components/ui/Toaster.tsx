'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
  ms?: number;
};

const ToastCtx = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <Toaster/>');
  return ctx;
}

export default function Toaster({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    const toast: Toast = { id, ms: 2400, variant: 'info', ...t };
    setList((L) => [...L, toast]);
    setTimeout(() => {
      setList((L) => L.filter((x) => x.id !== id));
    }, toast.ms);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          display: 'grid',
          gap: 8,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        {list.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              minWidth: 260,
              maxWidth: 360,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background:
                t.variant === 'success'
                  ? 'rgba(16,185,129,.10)'
                  : t.variant === 'error'
                  ? 'rgba(239,68,68,.10)'
                  : 'var(--card-bg, #fff)',
              boxShadow: '0 10px 34px rgba(0,0,0,.08)',
              transform: 'translateY(0)',
              animation: 'toast-in 200ms cubic-bezier(.2,.8,.2,1), toast-out 220ms ease forwards',
              animationDelay: `0ms, ${Math.max(0, (t.ms ?? 2400) - 220)}ms`,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
            {t.description && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t.description}</div>}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-out {
          to { opacity: 0; transform: translateY(8px) scale(.98); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
