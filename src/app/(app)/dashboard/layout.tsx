// src/app/(app)/dashboard/layout.tsx
import type { ReactNode } from "react";
import SidebarWrapper from "@/components/SidebarWrapper";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        <SidebarWrapper />
        <div className="flex-1">
          {/* Header sem props (server component) */}
          <Header />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
