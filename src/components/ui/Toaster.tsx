'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, Octagon, X } from 'lucide-react';

export type ToastLevel = 'success' | 'error' | 'info' | 'warning';

export type NeoToastPayload = {
  id?: string;
  title?: string;
  text?: string;
  description?: string;
  level?: ToastLevel;
  type?: ToastLevel;
  ttl?: number;
  duration?: number;
  durationMs?: number;
};

export const TOAST_EVENT = 'app:toast';

const ICONS: Record<ToastLevel, React.ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" />,
  error: <Octagon aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
};

type ViewportToast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastLevel;
};

type NeoToastViewportProps = {
  toasts: ViewportToast[];
  onDismiss: (id: string) => void;
};

export function NeoToastViewport({ toasts, onDismiss }: NeoToastViewportProps) {
  const [mounted, setMounted] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="neo-toast-viewport" aria-live="polite" aria-relevant="additions removals">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.article
            key={toast.id}
            layout
            className="neo-toast"
            data-tone={toast.tone}
            role="status"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.94 }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.28, ease: [0.18, 0.9, 0.22, 1] }}
          >
            <span className="neo-toast__icon" aria-hidden="true">
              {ICONS[toast.tone]}
            </span>
            <div className="neo-toast__body">
              <p className="neo-toast__title">{toast.title}</p>
              {toast.description ? (
                <p className="neo-toast__description">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="neo-toast__close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
            >
              <X aria-hidden="true" />
            </button>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

type ToastArgs = string | (NeoToastPayload & { title?: string; text?: string });

export function toast(message: ToastArgs, ttl = 3200, level: ToastLevel = 'info') {
  if (typeof window === 'undefined') return;

  const detail: NeoToastPayload =
    typeof message === 'string'
      ? { title: message, text: message, ttl, level }
      : {
          ...message,
          title: message.title ?? message.text,
          text: message.text ?? message.title,
          ttl: message.ttl ?? message.duration ?? message.durationMs ?? ttl,
          level: message.level ?? message.type ?? level,
        };

  window.dispatchEvent(new CustomEvent<NeoToastPayload>(TOAST_EVENT, { detail }));
}

export default function Toaster() {
  return null;
}
