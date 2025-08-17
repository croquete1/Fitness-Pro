"use client";

import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/SidebarWrapper";

/** Tema simples com persistência em localStorage */
const ThemeCtx = React.createContext<{ theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void } | null>(null);
export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("ThemeCtx not mounted");
  return ctx;
}
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fp.theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("fp.theme", theme); } catch {}
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
