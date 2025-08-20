import "@/app/globals.css";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";   // impede SSG
export const revalidate = 0;               // sem cache estática
export const fetchCache = "default-no-store";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // role obtido no servidor (evita useSession() durante o build)
  const session = await getServerSession(authOptions);
  const role = String((session as any)?.user?.role ?? "CLIENT").toUpperCase();

  return (
    <SidebarProvider>
      {/* Boot: aplica preferências de colapso antes de hidratar */}
      <script
        id="fp-sb-boot"
        dangerouslySetInnerHTML={{
          __html: `(function(){
            try{
              var v = localStorage.getItem('fp:sb:collapsed');
              if(v){ document.documentElement.setAttribute('data-sb-collapsed', v==='1'?'1':'0'); }
            }catch(e){}
          })();`,
        }}
      />

      <div className="fp-shell">
        <aside className="fp-sidebar">
          {/* Sidebar já sem useSession; recebe o role do servidor */}
          <Sidebar role={role} />
        </aside>

        <div className="fp-content">
          <header className="fp-header">
            <div className="fp-header-inner">
              <HeaderSearch />
              <AppHeader />
            </div>
          </header>

          <main className="fp-main">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
