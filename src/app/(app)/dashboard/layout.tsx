import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "Dashboard · Fitness Pro",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <div>
        <AppHeader />
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "1rem" }}>{children}</main>
      </div>
    </ClientProviders>
  );
}
