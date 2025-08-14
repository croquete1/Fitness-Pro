"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MobileSidebarController() {
  const pathname = usePathname();

  const close = () => {
    const html = document.documentElement;
    if (html.getAttribute("data-sidebar") === "open") {
      html.removeAttribute("data-sidebar");
    }
  };

  useEffect(() => {
    // Fechar ao carregar uma nova rota
    close();
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return <div className="fp-overlay" onClick={close} />;
}
