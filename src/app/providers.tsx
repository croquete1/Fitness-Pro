"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/SidebarWrapper";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
