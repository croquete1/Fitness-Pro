import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AppProviders from '@/components/AppProviders';
import OptionalSpeedInsights from '@/components/analytics/OptionalSpeedInsights';

export const metadata: Metadata = {
  title: 'HMS Personal Trainer',
  description: 'Plataforma inteligente para gerir clientes, planos e sessões HMS.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const storedMode = cookieStore.get('fp-mode')?.value === 'dark' ? 'dark' : 'light';
  return (
    <html lang="pt-PT" data-theme={storedMode}>
      <body suppressHydrationWarning>
        <AppProviders initialMode={storedMode}>
          {children}
        </AppProviders>
        <OptionalSpeedInsights />
      </body>
    </html>
  );
}
