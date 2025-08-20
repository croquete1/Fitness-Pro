import "@/app/globals.css";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Role = "ADMIN" | "TRAINER" | "CLIENT";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = ((session?.user as any)?.role ?? "ADMIN") as Role;

  return (
    <SidebarProvider>
      {/* aplica preferência (colapsada/expandida) antes de hidratar para não haver “salto” */}
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
