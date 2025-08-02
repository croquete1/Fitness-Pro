import { ReactNode } from "react";
import SidebarWrapper from "@/components/SidebarWrapper";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 bg-white">
        <SidebarWrapper />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
