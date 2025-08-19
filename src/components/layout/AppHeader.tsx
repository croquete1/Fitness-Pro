// src/components/layout/AppHeader.tsx
"use client";

import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppHeader() {
  // Lê o tema atual do atributo no <html> (definido no root layout boot script)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const t = document.documentElement.getAttribute("data-theme");
    return (t === "dark" ? "dark" : "light");
  });

  // Escreve no <html> + persiste no localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("fp:theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  const onSignOut = async () => {
    try {
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/login" });
    } catch {
      // fallback caso next-auth não esteja disponível neste bundle
      window.location.href = "/api/auth/signout";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notificações (placeholder) */}
      <button className="btn icon" aria-label="Notificações">
        <Bell size={18} />
      </button>

      {/* Tema claro/escuro */}
      <button
        className="btn icon"
        onClick={toggleTheme}
        aria-label="Alternar tema claro/escuro"
        title="Alternar tema"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Terminar sessão */}
      <button className="btn ghost" onClick={onSignOut}>
        Terminar sessão
      </button>
    </div>
  );
}
