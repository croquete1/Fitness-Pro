// src/app/(app)/dashboard/layout.tsx
import "@/app/globals.css";
import type { ReactNode } from "react";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import HeaderSearch from "@/components/layout/HeaderSearch";

/**
 * Layout do “app shell” (sidebar + header) para todas as rotas /dashboard.
 * - Mantém a preferência de “sidebar colapsada” sem salto visual (boot script).
 * - Header com barra de pesquisa (à esquerda) e ações (à direita).
 * - A largura do conteúdo ocupa todo o ecrã (controlado por classes .fp-* no globals.css).
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Aplica preferência (colapsada/expandida) antes de hidratar para não haver “salto” */}
      <script
        id="fp-sb-boot"
        // Nota: corre só no browser; em SSR não há localStorage mas não faz mal.
        dangerouslySetInnerHTML={{
          __html: `(function(){
            try{
              var v = localStorage.getItem('fp:sb:collapsed');
              if (v === '1' || v === '0') {
                document.documentElement.setAttribute('data-sb-collapsed', v);
              }
            }catch(e){}
          })();`,
        }}
      />

      <div className="fp-shell">
        {/* SIDEBAR (a largura real é controlada por --sb-w em globals.css) */}
        <aside className="fp-sidebar" data-testid="fp-sidebar">
          <Sidebar />
        </aside>

        {/* CONTEÚDO */}
        <div className="fp-content">
          {/* HEADER fixo com pesquisa + ações (menu hambúrguer incluído no AppHeader) */}
          <header className="fp-header">
            <div className="fp-header-inner">
              {/* Esquerda: barra de pesquisa global */}
              <HeaderSearch />

              {/* Direita: ações (hambúrguer para colapsar/expandir, sino, tema, logout, etc.) */}
              <AppHeader />
            </div>
          </header>

          {/* MAIN ocupa toda a largura disponível */}
          <main className="fp-main">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
