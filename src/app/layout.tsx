// src/app/layout.tsx  (ROOT LAYOUT – minimalista e estável)
import "./globals.css";
import type { Metadata } from "next";
import ToastProvider from '@/components/ui/ToastProvider';

export const metadata: Metadata = {
  title: "Fitness Pro",
  description: "Plataforma de gestão Fitness Pro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {/* Inicializa o tema MUITO cedo para evitar “flash” e sem depender de nenhum provider */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('fp:theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      {/* Mantém simples: nada de Sidebar/Providers aqui.
          O login renderiza normalmente; o shell completo fica no layout de (app)/dashboard */}
      <body data-auth-root>{children}
    export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
