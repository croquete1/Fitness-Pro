/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info';
type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  duration?: number; // ms
};

type ToastAPI = {
  show: (kind: ToastKind, title: string, opts?: { message?: string; duration?: number }) => void;
  success: (title: string, opts?: { message?: string; duration?: number }) => void;
  error: (title: string, opts?: { message?: string; duration?: number }) => void;
  info: (title: string, opts?: { message?: string; duration?: number }) => void;
};

const ToastCtx = createContext<ToastAPI | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>.');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setList((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current[id];
    if (t) {
      clearTimeout(t);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback<ToastAPI['show']>((kind, title, opts) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      kind,
      title,
      message: opts?.message,
      duration: opts?.duration ?? 3500,
    };
    setList((prev) => [...prev, item]);

    timers.current[id] = setTimeout(() => remove(id), item.duration);
  }, []);

  const api = useMemo<ToastAPI>(
    () => ({
      show,
      success: (title, opts) => show('success', title, opts),
      error: (title, opts) => show('error', title, opts),
      info: (title, opts) => show('info', title, opts),
    }),
    []
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Viewport */}
      <div className="fp-toast-viewport" aria-live="polite" aria-atomic="true">
        {list.map((t) => (
          <div key={t.id} className={`fp-toast fp-toast--${t.kind}`} role="status">
            <div className="fp-toast-title">{t.title}</div>
            {t.message ? <div className="fp-toast-msg">{t.message}</div> : null}
            <button className="fp-toast-x" onClick={() => remove(t.id)} aria-label="Fechar">×</button>
          </div>
        ))}
      </div>

      {/* styles (scoped) */}
      <style jsx global>{`
        .fp-toast-viewport{
          position: fixed;
          z-index: 99999;
          right: 16px;
          bottom: 16px;
          display: grid;
          gap: 10px;
          max-width: min(420px, calc(100vw - 32px));
        }
        .fp-toast{
          position: relative;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
          border-radius: 12px;
          padding: 10px 36px 10px 12px;
          box-shadow: 0 10px 35px rgba(0,0,0,.18);
          animation: fp-toast-in .2s ease;
        }
        .fp-toast--success{ border-color: color-mix(in srgb, var(--success) 40%, var(--border)); }
        .fp-toast--error{   border-color: color-mix(in srgb, var(--danger)  40%, var(--border)); }
        .fp-toast--info{    border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
        .fp-toast-title{ font-weight: 700; font-size: 14px; }
        .fp-toast-msg{ font-size: 12px; opacity: .8; margin-top: 2px; }
        .fp-toast-x{
          position: absolute; right: 6px; top: 4px;
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--btn-bg);
        }
        @keyframes fp-toast-in{
          from { transform: translateY(6px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
