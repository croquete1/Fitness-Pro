"use client";

import { useSidebarState } from "@/components/SidebarWrapper";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, Pin, Menu } from "lucide-react";

export default function AppHeader() {
  const { collapsed, toggleCollapsed, pinned, togglePinned } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      {/* HAMBÚRGUER -> compacta/expande a sidebar */}
      <button
        aria-label={collapsed ? "Expandir sidebar" : "Compactar sidebar"}
        className="btn icon"
        onClick={toggleCollapsed}
        title={collapsed ? "Expandir sidebar" : "Compactar sidebar"}
      >
        <Menu size={18} />
      </button>

      {/* PIN -> fixa/desfixa (continua visível em ambos os modos) */}
      <button
        aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
        className="btn icon"
        onClick={togglePinned}
        title={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
      >
        <Pin size={18} style={{ transform: pinned ? "rotate(0deg)" : "rotate(45deg)" }} />
      </button>

      <button className="btn icon" aria-label="Notificações" title="Notificações">
        <Bell size={18} />
      </button>

      <button
        className="btn icon"
        onClick={onToggleTheme}
        aria-label="Alternar tema"
        title="Alternar tema"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <a className="btn ghost" href="/api/auth/signout">
        Terminar sessão
      </a>
    </div>
  );
}
