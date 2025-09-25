'use client';

import * as React from 'react';
import { Alert, Snackbar } from '@mui/material';

type Level = 'success' | 'error' | 'info' | 'warning';

type ToastPayload = { text: string; level?: Level; ttl?: number };

const EVT = 'app:toast';

export function toast(text: string, ttl = 3000, level: Level = 'info') {
  if (typeof window === 'undefined') return;
  const detail: ToastPayload = { text, ttl, level };
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVT, { detail }));
}

export function Toaster() {
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState<ToastPayload>({ text: '' });

  React.useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      setMsg(detail);
      setOpen(true);
    };
    window.addEventListener(EVT, onToast as EventListener);
    return () => window.removeEventListener(EVT, onToast as EventListener);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={msg.ttl ?? 3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity={msg.level ?? 'info'} onClose={() => setOpen(false)} variant="filled" elevation={3}>
        {msg.text}
      </Alert>
    </Snackbar>
  );
}

export default Toaster;
