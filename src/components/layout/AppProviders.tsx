// src/components/layout/AppProviders.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import SidebarProvider from "@/components/SidebarWrapper";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
