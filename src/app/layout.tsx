// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';
import ClientProviders from '@/components/ui/ClientProviders';
import '@/app/(app)/theme.css';

export const metadata: Metadata = {
  title: 'Fitness Pro',
  description: 'Dashboard Fitness Pro',
};

// Melhora a experiência em mobile e deixa claro que suportamos dark/light
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f141b' },
  ],
  colorScheme: 'light dark',
};

// Inicializa tema + estado da sidebar o mais cedo possível (sem hidratação)
const headBootScript = `
(function () {
  try {
    var doc = document.documentElement;

    // ----- Tema (light/dark)
    var t = localStorage.getItem('theme');
    if (!t) {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    doc.setAttribute('data-theme', t);

    // ----- Sidebar (pinned/collapsed) – chaves persistidas pelo SidebarProvider
    var pinned = localStorage.getItem('fp.sb.pinned');     // '0' | '1' | null
    var collapsed = localStorage.getItem('fp.sb.collapsed'); // '0' | '1' | null

    // Defaults seguros (pinned=1, collapsed=0)
    doc.setAttribute('data-sb-pinned', pinned === '0' ? '0' : '1');
    doc.setAttribute('data-sb-collapsed', collapsed === '1' ? '1' : '0');
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Boot do tema + sidebar antes de qualquer render */}
        <script dangerouslySetInnerHTML={{ __html: headBootScript }} />
      </head>
      <body>
        {/* Providers client-side (React Query, Toaster, etc.) */}
        <ClientProviders>
          <ToastProvider>{children}</ToastProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
