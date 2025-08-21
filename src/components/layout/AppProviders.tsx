"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

/** Providers do app (Session, etc). Coloca isto no layout do segmento (app). */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
