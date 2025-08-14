// src/app/(app)/dashboard/layout.tsx
import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import SidebarWrapper from "@/components/SidebarWrapper";
import ClientProviders from "@/components/ClientProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Dashboard · Fitness Pro",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <ClientProviders session={session}>
      <AppHeader />
      <SidebarWrapper>{children}</SidebarWrapper>
    </ClientProviders>
  );
}
