"use client";

import { ThemeProvider } from "next-themes";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"       // <- necessário para [data-theme="dark"] do teu CSS
      defaultTheme="light"
      enableSystem={false}         // controlamos só light/dark
      storageKey="fp:theme"        // mantém a preferência do utilizador
    >
      {children}
    </ThemeProvider>
  );
}
