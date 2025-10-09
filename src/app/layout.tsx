import './globals.css';
import type { Metadata } from 'next';
import ColorModeProvider from '@/components/layout/ColorModeProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Dashboard Fitness Pro (MUI puro)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <ColorModeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ColorModeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
