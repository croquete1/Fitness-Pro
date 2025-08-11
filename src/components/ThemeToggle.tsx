"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark =
      stored ? stored === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    if (prefersDark) root.classList.add("dark");
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    root.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm
                 hover:bg-black/5 dark:hover:bg-white/5 transition"
    >
      {isDark ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1m9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1M6 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1m12.95 6.536a1 1 0 0 1-1.414 0l-1.415-1.415a1 1 0 1 1 1.415-1.414l1.414 1.414a1 1 0 0 1 0 1.415M7.879 7.879A1 1 0 0 1 6.464 6.464L5.05 5.05a1 1 0 0 1 1.414-1.414l1.415 1.414A1 1 0 0 1 7.88 7.88m8.485 0a1 1 0 0 1 0-1.415l1.414-1.414A1 1 0 1 1 19.192 6.464l-1.414 1.415a1 1 0 0 1-1.414 0M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1M5.05 18.95a1 1 0 0 1 0-1.414l1.414-1.415a1 1 0 1 1 1.415 1.415L6.464 18.95a1 1 0 0 1-1.414 0Z"/>
          </svg>
          Tema: Escuro
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <path fill="currentColor" d="M20.742 13.045A8.001 8.001 0 0 1 10.955 3.258a1 1 0 0 0-1.35-1.068A10 10 0 1 0 21.81 14.395a1 1 0 0 0-1.068-1.35Z"/>
          </svg>
          Tema: Claro
        </>
      )}
    </button>
  );
}
