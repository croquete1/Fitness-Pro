// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-xl border px-3 py-2 text-sm hover:shadow transition"
      title={isDark ? "Mudar para claro" : "Mudar para escuro"}
    >
      {isDark ? "🌙 Escuro" : "☀️ Claro"}
    </button>
  );
}
