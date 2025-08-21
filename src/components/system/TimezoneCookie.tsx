"use client";

import { useEffect } from "react";

/** Grava a timeZone do browser num cookie "tz" (1 ano). */
export default function TimezoneCookie() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      const enc = encodeURIComponent(tz);
      const current = document.cookie.match(/(?:^|;\s*)tz=([^;]+)/)?.[1];
      if (current !== enc) {
        document.cookie = `tz=${enc}; path=/; max-age=31536000; samesite=lax`;
      }
    } catch {
      /* no-op */
    }
  }, []);
  return null;
}
