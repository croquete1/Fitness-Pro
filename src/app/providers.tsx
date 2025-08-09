"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      // Evita pedir /api/auth/session ao focar a janela
      refetchOnWindowFocus={false}
      // Evita polling periódico da sessão (pode voltar a ativar se quiser)
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}
