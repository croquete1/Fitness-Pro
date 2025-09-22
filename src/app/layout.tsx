// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fitness Pro',
    template: '%s · Fitness Pro',
  },
  description: 'Gestão de treino e progresso',
  applicationName: 'Fitness Pro',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    title: 'Fitness Pro',
    siteName: 'Fitness Pro',
    description: 'Gestão de treino e progresso',
    images: ['/logo.png'], // será resolvido com metadataBase
    locale: 'pt_PT',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'Fitness Pro',
    description: 'Gestão de treino e progresso',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0b' },
  ],
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
