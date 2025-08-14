// src/app/(app)/dashboard/layout.tsx
import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import SidebarWrapper from "@/components/SidebarWrapper";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "Dashboard · Fitness Pro",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <AppHeader />
      <SidebarWrapper>{children}</SidebarWrapper>
    </ClientProviders>
  );
}
