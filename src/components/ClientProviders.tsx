// src/components/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import type { Session } from "next-auth";

export default function ClientProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session ?? undefined}>{children}</SessionProvider>;
}
