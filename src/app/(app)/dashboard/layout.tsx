import "@/app/globals.css";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Boot rápido para aplicar a preferência antes da hidratação (evita “salto”) */}
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
          <Sidebar />
        </aside>

        <div className="fp-content">
          <header className="fp-header">
            <div className="fp-header-inner">
              <div /> {/* espaço à esquerda (ex. pesquisa) */}
              <AppHeader />
            </div>
          </header>

          <main className="fp-main">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
