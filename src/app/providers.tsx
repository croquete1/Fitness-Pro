"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}   // evita pedir sessão ao focar a janela
      refetchInterval={0}            // evita polling periódico
    >
      {children}
    </SessionProvider>
  );
}
