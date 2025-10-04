// src/app/(app)/layout.tsx
// Layout raiz da área autenticada (Server Component)
import * as React from 'react';
import ColorModeProvider from '@/components/layout/ColorModeProvider';
import SidebarProvider from '@/components/layout/SidebarProvider';
import ThemeBridge from '@/components/theme/ThemeBridge'; // ✅ mantém <html data-theme> em sync com MUI

export default function Layout({ children }: { children: React.ReactNode }) {
  // Nota: ColorModeProvider deve encapsular ThemeProvider + CssBaseline (como no teu projeto).
  // ThemeBridge só lê o modo atual e sincroniza o atributo data-theme do <html>.
  return (
    <ColorModeProvider>
      {/* ✅ evita “sidebar num tema e conteúdo noutro” */}
      <ThemeBridge />
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ColorModeProvider>
  );
}
