// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

// MUI + App Router (cache/SSR para Emotion)
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

// O teu provider de tema/QueryClient/etc.
// (pelo teu repo, está em components/layout/AppProviders.tsx)
import AppProviders from '@/components/layout/AppProviders';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Painel de gestão para Admin, PT e Cliente',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head />
      <body data-auth-root="">
        <AppRouterCacheProvider>
          <AppProviders>{children}</AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
