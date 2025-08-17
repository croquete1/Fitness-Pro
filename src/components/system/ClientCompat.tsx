"use client";

import { useEffect } from "react";

/**
 * Compat: evita erros em browsers que não têm Performance API completa
 * e outros edge-cases de SSR/CSR no arranque.
 */
export default function ClientCompat() {
  useEffect(() => {
    try {
      // performance.measure ausente em Firefox antigos => cria no-op
      if (typeof performance !== "undefined" && typeof (performance as any).measure !== "function") {
        (performance as any).measure = () => {};
      }
      if (typeof performance !== "undefined" && typeof (performance as any).getEntriesByType !== "function") {
        (performance as any).getEntriesByType = () => [];
      }
    } catch {
      // no-op
    }
  }, []);

  return null;
}
