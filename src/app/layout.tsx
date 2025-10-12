import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AppProviders from '@/components/AppProviders';
import OptionalSpeedInsights from '@/components/analytics/OptionalSpeedInsights';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: 'Plataforma inteligente para gerir clientes, planos e sessões.',
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
