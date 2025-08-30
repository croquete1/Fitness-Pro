'use client';

import { ToastProvider } from './Toasts';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Aqui podes acrescentar outros providers no futuro (Theme, Query, etc.)
  return <ToastProvider>{children}</ToastProvider>;
}
