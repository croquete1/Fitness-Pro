"use client";

import { useEffect } from "react";

type Props = {
  onClose?: () => void;
};

export default function MobileSidebarController({ onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose?.();
    };
    const handleResize = () => {
      // Fechar sidebar ao passar para _desktop_ (prevenir estados presos)
      if (window.innerWidth >= 1024) onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  return null; // controlador invisível
}
