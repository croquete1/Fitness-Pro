// src/components/ThemeToggle.tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
      title={isDark ? "Mudar para claro" : "Mudar para escuro"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
