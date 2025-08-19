import "@/app/globals.css";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import HeaderSearch from "@/components/layout/HeaderSearch";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* aplica preferência (colapsada/expandida) antes de hidratar para não haver “salto” */}
<script
  id="fp-sb-boot"
  dangerouslySetInnerHTML={{
    __html: `(function () {
      try {
        var p = localStorage.getItem('fp:sb:pinned');
        var c = localStorage.getItem('fp:sb:collapsed');
        // Se estiver fixada, força expandida
        if (p === '1') {
          document.documentElement.setAttribute('data-sb-collapsed','0');
        } else if (c) {
          document.documentElement.setAttribute('data-sb-collapsed', c === '1' ? '1' : '0');
        }
      } catch (e) {}
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