'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import MuiProviders from '@/components/providers/MuiProviders';

type Props = { children: React.ReactNode };

export default function AppProviders({ children }: Props) {
  // ⚠️ Tudo aqui dentro corre no cliente
  return (
    <AppRouterCacheProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider refetchOnWindowFocus={false}>
          {/* Mantém teu ThemeProvider/CssBaseline/etc dentro do SessionProvider */}
          <MuiProviders>{children}</MuiProviders>
        </SessionProvider>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
