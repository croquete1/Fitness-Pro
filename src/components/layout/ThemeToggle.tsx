"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const LS_KEY = "fp:theme"; // "light" | "dark"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as "light" | "dark" | null;
      const initial =
        saved ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {}
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(LS_KEY, next); } catch {}
  };

  return (
    <button className="btn icon" aria-label="Alternar tema" onClick={toggle}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
