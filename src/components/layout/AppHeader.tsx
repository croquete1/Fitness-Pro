"use client";

import { useTheme } from "next-themes";
import useSidebarState from "../SidebarWrapper";

export default function AppHeader() {
  const { toggleCollapsed } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
      <div className="h-14 px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapsed}
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            title="Mostrar/ocultar sidebar"
          >
            ☰
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={toggleTheme}
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            title="Alternar tema"
          >
            {theme === "dark" ? "🌙" : "🌞"}
          </button>

          <a
            href="/api/auth/signout"
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Terminar sessão
          </a>
        </div>
      </div>
    </header>
  );
}
