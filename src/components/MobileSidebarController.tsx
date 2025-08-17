"use client";
import { useEffect } from "react";

export default function MobileSidebarController({ onClose }: { onClose?: () => void }) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") onClose?.(); };
    const onResize = () => { if (window.innerWidth >= 1024) onClose?.(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  return null;
}
