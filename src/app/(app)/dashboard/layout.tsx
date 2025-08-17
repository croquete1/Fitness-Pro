// src/app/(app)/dashboard/layout.tsx
import AppHeader from "@/components/layout/AppHeader";
import SidebarWrapper from "@/components/SidebarWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fp-page">
      <AppHeader />
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
