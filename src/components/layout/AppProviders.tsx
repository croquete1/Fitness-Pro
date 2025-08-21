"use client";

import { SessionProvider } from "next-auth/react";
import SidebarProvider from "@/components/SidebarWrapper";
import { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
