// src/app/(app)/dashboard/layout.tsx
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientProviders from "@/components/ClientProviders";
import AppHeader from "@/components/layout/AppHeader";
import SidebarWrapper from "@/components/SidebarWrapper";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <ClientProviders session={session}>
      <AppHeader />
      <SidebarWrapper>{children}</SidebarWrapper>
    </ClientProviders>
  );
}
