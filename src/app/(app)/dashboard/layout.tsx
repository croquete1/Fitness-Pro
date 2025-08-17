import React from "react";
import SidebarWrapper from "@/components/SidebarWrapper";

// Impede SSG/Prerender neste segmento (usa SSR/edge em runtime)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarWrapper>{children}</SidebarWrapper>;
}
