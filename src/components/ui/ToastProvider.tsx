'use client';

import * as React from 'react';
import {
  NeoToastViewport,
  TOAST_EVENT,
  type NeoToastPayload,
  type ToastLevel,
} from '@/components/ui/Toaster';

const DEFAULT_TTL = 3200;

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastLevel;
  ttl: number;
};

type ToastCtx = {
  show: (msg: string, sev?: ToastLevel, durationMs?: number) => void;
  success: (msg: string, durationMs?: number) => void;
  error: (msg: string, durationMs?: number) => void;
  info: (msg: string, durationMs?: number) => void;
  warning: (msg: string, durationMs?: number) => void;
};

const ToastContext = React.createContext<ToastCtx | null>(null);

function isTone(value: unknown): value is ToastLevel {
  return value === 'success' || value === 'error' || value === 'info' || value === 'warning';
}

function normalize(detail: NeoToastPayload | string | null | undefined): Omit<ToastItem, 'id'> & { id?: string } | null {
  if (!detail) return null;

  if (typeof detail === 'string') {
    return { id: undefined, title: detail, description: undefined, tone: 'info', ttl: DEFAULT_TTL };
  }

  const title =
    detail.title ??
    detail.text ??
    // Compatibilidade com emitters antigos
    // @ts-expect-error propriedades dinâmicas vindas de eventos legacy
    detail.message ??
    // @ts-expect-error idem
    detail.msg ??
    '';
  if (!title) return null;

  const description =
    detail.description ??
    // @ts-expect-error compat campos antigos
    detail.body ??
    // @ts-expect-error compat campos antigos
    detail.subtitle;
  const ttlCandidate =
    detail.ttl ??
    detail.duration ??
    detail.durationMs ??
    // @ts-expect-error compat campos antigos
    detail.timeout ??
    // @ts-expect-error compat campos antigos
    detail.ms;
  const ttl = typeof ttlCandidate === 'number' && ttlCandidate >= 0 ? ttlCandidate : DEFAULT_TTL;
  const toneCandidate =
    detail.level ??
    detail.type ??
    // @ts-expect-error compat campos antigos
    detail.tone ??
    // @ts-expect-error compat campos antigos
    detail.status ??
    // @ts-expect-error compat campos antigos
    detail.sev;
  const tone = isTone(toneCandidate) ? toneCandidate : 'info';

  return { id: detail.id, title, description, tone, ttl };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const timers = React.useRef<Map<string, number>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (typeof window !== 'undefined') {
      const handle = timers.current.get(id);
      if (handle) {
        window.clearTimeout(handle);
        timers.current.delete(id);
      }
    }
  }, []);

  const push = React.useCallback((payload: Omit<ToastItem, 'id'> & { id?: string }) => {
    const id = payload.id ?? Math.random().toString(36).slice(2);
    const ttl = payload.ttl >= 0 ? payload.ttl : DEFAULT_TTL;

    setItems((prev) => {
      const nextItem: ToastItem = { id, title: payload.title, description: payload.description, tone: payload.tone, ttl };
      const filtered = prev.filter((item) => item.id !== id);
      return [nextItem, ...filtered].slice(0, 5);
    });

    if (typeof window !== 'undefined' && ttl > 0) {
      const handle = window.setTimeout(() => dismiss(id), ttl);
      timers.current.set(id, handle);
    }

    return id;
  }, [dismiss]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<NeoToastPayload | string>).detail;
      const normalized = normalize(detail);
      if (normalized) push(normalized);
    };

    window.addEventListener(TOAST_EVENT, handler as EventListener);
    return () => window.removeEventListener(TOAST_EVENT, handler as EventListener);
  }, [push]);

  React.useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return;
      timers.current.forEach((handle) => window.clearTimeout(handle));
      timers.current.clear();
    };
  }, []);

  const context = React.useMemo<ToastCtx>(() => ({
    show: (msg, sev = 'info', durationMs) => {
      push({ title: msg, tone: isTone(sev) ? sev : 'info', ttl: durationMs ?? DEFAULT_TTL });
    },
    success: (msg, durationMs) => {
      push({ title: msg, tone: 'success', ttl: durationMs ?? DEFAULT_TTL });
    },
    error: (msg, durationMs) => {
      push({ title: msg, tone: 'error', ttl: durationMs ?? DEFAULT_TTL });
    },
    info: (msg, durationMs) => {
      push({ title: msg, tone: 'info', ttl: durationMs ?? DEFAULT_TTL });
    },
    warning: (msg, durationMs) => {
      push({ title: msg, tone: 'warning', ttl: durationMs ?? DEFAULT_TTL });
    },
  }), [push]);

  return (
    <ToastContext.Provider value={context}>
      {children}
      <NeoToastViewport
        toasts={items.map((item) => ({ id: item.id, title: item.title, description: item.description, tone: item.tone }))}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
