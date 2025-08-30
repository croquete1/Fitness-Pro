// src/components/ui/ClientProviders.tsx
'use client';
import ToastsProvider from '@/components/ui/Toasts';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastsProvider>{children}</ToastsProvider>;
}
