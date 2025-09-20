// src/app/layout.tsx
import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import MuiProviders from '@/components/providers/MuiProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Gestão de treino e progresso',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <MuiProviders>{children}</MuiProviders>
          </NextThemesProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
