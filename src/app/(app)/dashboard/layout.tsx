// src/app/(app)/dashboard/layout.tsx  (apenas referência)
import SidebarWrapper from "@/components/SidebarWrapper";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full">
      <div className="flex">
        <SidebarWrapper />
        <div className="flex-1">
          <Header />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
