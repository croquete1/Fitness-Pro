import "@/app/globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import Topbar from "@/components/Topbar";
import { useMe } from "@/hooks/useMe";

export const metadata = { title: "Dashboard • Fitness Pro" };

function HeaderBridge() {
  // pequeno client wrapper para obter role do utilizador no topo
  const { user } = useMe();
  return <Topbar role={user?.role ?? null} />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <HeaderBridge />
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  );
}
