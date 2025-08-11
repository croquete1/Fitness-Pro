"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
