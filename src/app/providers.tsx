"use client";

/**
 * App-level providers (ex.: tema). A sidebar NÃO é inicializada aqui
 * para evitar dependências no SSR/SSG. O provider da sidebar vive
 * no layout do dashboard.
 */
import * as React from "react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
