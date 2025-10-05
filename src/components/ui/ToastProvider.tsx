'use client';

import * as React from 'react';
import { Snackbar, Alert } from '@mui/material';

type Sev = 'success' | 'error' | 'info' | 'warning';
type ToastItem = { msg: string; sev: Sev; duration?: number };

type ToastCtx = {
  show: (msg: string, sev?: Sev, durationMs?: number) => void;
  success: (msg: string, durationMs?: number) => void;
  error: (msg: string, durationMs?: number) => void;
  info: (msg: string, durationMs?: number) => void;
  warning: (msg: string, durationMs?: number) => void;
};

const Ctx = React.createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = React.useState<ToastItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<ToastItem | null>(null);

  const next = React.useCallback(() => {
    setCurrent(null);
    setOpen(false);
    setQueue((q) => {
      if (q.length <= 1) return [];
      const [, ...rest] = q;
      return rest;
    });
  }, []);

  React.useEffect(() => {
    if (!open && !current && queue.length) {
      setCurrent(queue[0]);
      setOpen(true);
    }
  }, [queue, open, current]);

  const api = React.useMemo<ToastCtx>(() => ({
    show: (msg, sev = 'info', durationMs = 3000) => setQueue((q) => [...q, { msg, sev, duration: durationMs }]),
    success: (msg, d) => setQueue((q) => [...q, { msg, sev: 'success', duration: d }]),
    error: (msg, d) => setQueue((q) => [...q, { msg, sev: 'error', duration: d }]),
    info: (msg, d) => setQueue((q) => [...q, { msg, sev: 'info', duration: d }]),
    warning: (msg, d) => setQueue((q) => [...q, { msg, sev: 'warning', duration: d }]),
  }), []);

  return (
    <Ctx.Provider value={api}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={current?.duration ?? 3000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setOpen(false); }}
        // ✅ MUI v5: onExited vai dentro de TransitionProps
        TransitionProps={{ onExited: next }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={current?.sev ?? 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {current?.msg ?? ''}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
