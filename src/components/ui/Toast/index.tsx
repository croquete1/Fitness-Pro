'use client';
import React, {createContext, useContext, useMemo, useState, useCallback} from 'react';

type ToastItem = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // ms
};
type ToastCtx = {
  push: (t: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems(s => s.filter(t => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<ToastItem,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, duration: 4000, ...t };
    setItems(s => [item, ...s]);
    if (item.duration && item.duration > 0) {
      setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, [dismiss]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ push, dismiss, clear }), [push, dismiss, clear]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {items.map(t => (
          <div key={t.id} className="toast">
            <div className="toast-msg">{t.message}</div>
            {t.actionLabel && t.onAction && (
              <button className="toast-action" onClick={() => { t.onAction?.(); dismiss(t.id); }}>
                {t.actionLabel}
              </button>
            )}
            <button className="toast-close" aria-label="Fechar" onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
