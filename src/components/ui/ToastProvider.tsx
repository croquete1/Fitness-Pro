'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';
import * as ReactDOM from 'react-dom';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

type ToastVariant = 'success' | 'info' | 'warning' | 'error';
export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms (default 3500)
  action?: { label: string; onClick: () => void };
};

type ToastItem = Required<ToastOptions> & { id: string; leaving: boolean };

type ToastContextValue = {
  show: (opts: ToastOptions) => string;
  success: (msg: string, opts?: Omit<ToastOptions, 'description' | 'variant'>) => string;
  info: (msg: string, opts?: Omit<ToastOptions, 'description' | 'variant'>) => string;
  warning: (msg: string, opts?: Omit<ToastOptions, 'description' | 'variant'>) => string;
  error: (msg: string, opts?: Omit<ToastOptions, 'description' | 'variant'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const props = { size: 18, 'aria-hidden': true } as const;
  if (variant === 'success') return <CheckCircle {...props} />;
  if (variant === 'warning') return <AlertTriangle {...props} />;
  if (variant === 'error') return <XCircle {...props} />;
  return <Info {...props} />;
}

function ToastCard({
  t,
  onClose,
}: {
  t: ToastItem;
  onClose: (id: string) => void;
}) {
  return (
    <div
      className="fp-toast"
      data-variant={t.variant}
      data-state={t.leaving ? 'leave' : 'enter'}
      role="status"
      aria-live="polite"
      style={{ ['--dur' as any]: `${t.duration}ms` }}
    >
      <div className="fp-toast-icon">
        <ToastIcon variant={t.variant} />
      </div>

      <div className="fp-toast-content">
        {t.title && <div className="fp-toast-title">{t.title}</div>}
        {t.description && <div className="fp-toast-desc">{t.description}</div>}
        {t.action && (
          <button
            className="fp-toast-action"
            onClick={() => {
              try { t.action!.onClick(); } finally { onClose(t.id); }
            }}
          >
            {t.action.label}
          </button>
        )}
        <div className="fp-toast-progress" />
      </div>

      <button
        className="fp-toast-close"
        aria-label="Fechar"
        onClick={() => onClose(t.id)}
        title="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const createId = () => Math.random().toString(36).slice(2, 9);

  const scheduleAutoDismiss = useCallback((id: string, ms: number) => {
    if (timers.current.has(id)) clearTimeout(timers.current.get(id)!);
    const tm = setTimeout(() => {
      // trigger leave anim first
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        timers.current.delete(id);
      }, 170); // deve combinar com a duração de saída no CSS
    }, ms);
    timers.current.set(id, tm);
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? createId();
    const item: ToastItem = {
      id,
      title: opts.title ?? '',
      description: opts.description ?? '',
      variant: opts.variant ?? 'info',
      duration: Math.max(1500, opts.duration ?? 3500),
      action: opts.action ?? (undefined as any),
      leaving: false,
    };
    setToasts(prev => [item, ...prev]);
    scheduleAutoDismiss(id, item.duration);
    return id;
  }, [scheduleAutoDismiss]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      if (timers.current.has(id)) clearTimeout(timers.current.get(id)!);
      timers.current.delete(id);
    }, 170);
  }, []);

  const clear = useCallback(() => {
    [...timers.current.values()].forEach(clearTimeout);
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => () => clear(), [clear]);

  const api: ToastContextValue = useMemo(() => ({
    show,
    success: (msg, o) => show({ ...o, title: msg, variant: 'success' }),
    info:    (msg, o) => show({ ...o, title: msg, variant: 'info' }),
    warning: (msg, o) => show({ ...o, title: msg, variant: 'warning' }),
    error:   (msg, o) => show({ ...o, title: msg, variant: 'error' }),
    dismiss,
    clear,
  }), [show, dismiss, clear]);

  const host = (
    <div className="fp-toast-host" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <ToastCard key={t.id} t={t} onClose={dismiss} />
      ))}
    </div>
  );

  // portal para o <body> (SSR-safe)
  const portal =
    typeof document !== 'undefined'
      ? ReactDOM.createPortal(host, document.body)
      : host;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}
