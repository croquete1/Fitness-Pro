// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Gestão de treino e progresso',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        {/* Tudo o que precisa de React context de cliente fica aqui dentro */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
