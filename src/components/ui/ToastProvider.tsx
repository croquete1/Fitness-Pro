'use client';

import * as React from 'react';
import { AlertColor, Button, Snackbar, Alert, Stack } from '@mui/material';

type ToastAction = { label: string; onClick: () => void };
type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
  action?: ToastAction;
  autoHideDuration?: number;
};

const ToastCtx = React.createContext<{
  toast: (opts: { message: string; severity?: AlertColor; action?: ToastAction; autoHideDuration?: number }) => void;
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
  warning: (message: string, action?: ToastAction) => void;
} | null>(null);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = React.useState<ToastState>({ open: false, message: '', severity: 'info' });
  const [queue, setQueue] = React.useState<ToastState[]>([]);

  const show = (next: ToastState) => {
    if (s.open) setQueue(q => [...q, next]);
    else setS(next);
  };

  const toast = (opts: { message: string; severity?: AlertColor; action?: ToastAction; autoHideDuration?: number }) =>
    show({ open: true, message: opts.message, severity: opts.severity ?? 'info', action: opts.action, autoHideDuration: opts.autoHideDuration ?? 3000 });

  const api = React.useMemo(() => ({
    toast,
    success: (message: string, action?: ToastAction) => toast({ message, severity: 'success', action }),
    error: (message: string, action?: ToastAction) => toast({ message, severity: 'error', action }),
    info: (message: string, action?: ToastAction) => toast({ message, severity: 'info', action }),
    warning: (message: string, action?: ToastAction) => toast({ message, severity: 'warning', action }),
  }), []);

  const handleClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setS(p => ({ ...p, open: false }));
  };
  const handleExited = () => {
    if (queue.length > 0) {
      const [n, ...rest] = queue;
      setQueue(rest);
      setS(n);
    }
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <Snackbar
        open={s.open}
        onClose={handleClose}
        autoHideDuration={s.autoHideDuration}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionProps={{ onExited: handleExited }}
      >
        <Alert
          severity={s.severity}
          variant="filled"
          onClose={handleClose}
          sx={{ alignItems: 'center', pr: s.action ? 0 : 2 }}
          iconMapping={{ success: <>✅</>, error: <>❌</>, info: <>ℹ️</>, warning: <>⚠️</> }}
          action={
            s.action ? (
              <Stack direction="row" spacing={0.5} sx={{ pl: 1, pr: 1 }}>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    try { s.action?.onClick(); } finally { handleClose(); }
                  }}
                >
                  {s.action.label}
                </Button>
              </Stack>
            ) : null
          }
        >
          {s.message}
        </Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
