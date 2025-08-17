import type { ReactNode } from "react";
import { SidebarStateProvider } from "@/components/sidebar/SidebarState";
import SidebarWrapper from "@/components/SidebarWrapper";
import HeaderBridge from "@/components/HeaderBridge";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <SidebarStateProvider>
          {/* O teu header pode incluir o HeaderBridge (opcional): */}
          <div className="fp-header">
            <HeaderBridge />
            {/* ... resto do teu header (search, logout, etc.) ... */}
          </div>

          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </SidebarStateProvider>
      </body>
    </html>
  );
}
