// src/app/(app)/dashboard/layout.tsx
import "@/app/globals.css";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

// Carregar componentes client apenas no browser (evita crashes de SSR/hidratação)
const SidebarProvider = dynamic(() => import("@/components/SidebarWrapper"), {
  ssr: false,
});
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const AppHeader = dynamic(() => import("@/components/layout/AppHeader"), {
  ssr: false,
});
const HeaderSearch = dynamic(
  () => import("@/components/layout/HeaderSearch"),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* Aplica a preferência antes da hidratação (sem “salto”) */}
      <script
        id="fp-sb-boot"
        dangerouslySetInnerHTML={{
          __html: `(function(){
            try{
              var v = localStorage.getItem('fp:sb:collapsed');
              if (v === '1') {
                document.documentElement.setAttribute('data-sb-collapsed','1');
              } else {
                document.documentElement.removeAttribute('data-sb-collapsed');
              }
            }catch(e){}
          })();`,
        }}
      />

      {/* Provider e UI só no cliente */}
      <SidebarProvider>
        <div className="fp-shell">
          {/* SIDEBAR (largura controlada por --sb-w em globals.css) */}
          <aside className="fp-sidebar" data-testid="fp-sidebar">
            <Sidebar />
          </aside>

          {/* CONTEÚDO */}
          <div className="fp-content">
            <header className="fp-header">
              <div className="fp-header-inner">
                {/* Esquerda: barra de pesquisa */}
                <HeaderSearch />
                {/* Direita: ações (hambúrguer para colapsar/expandir, sino, tema, logout, etc.) */}
                <AppHeader />
              </div>
            </header>

            <main className="fp-main">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
