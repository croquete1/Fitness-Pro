// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Dashboard Fitness Pro',
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {/* Inicializa tema cedo para evitar FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ClientProviders>
          <ToastProvider>{children}</ToastProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
