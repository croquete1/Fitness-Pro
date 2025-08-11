"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Ícones inline (sem dependências)
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path
        d="M12 4V2m0 20v-2M4.93 4.93 3.52 3.52m16.96 16.96-1.41-1.41M4 12H2m20 0h-2M4.93 19.07 3.52 20.48m16.96-16.96-1.41 1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? systemTheme : theme;
  const isDark = mounted ? current === "dark" : false;

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm bg-card hover:bg-muted transition shadow-sm"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="ml-2">{isDark ? "Claro" : "Escuro"}</span>
    </button>
  );
}
