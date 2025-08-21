"use client";

import { useEffect } from "react";

/**
 * Escreve cookies com o fuso-horário e offset do utilizador.
 * fp_tz: IANA timezone (ex.: "Europe/Lisbon")
 * fp_tz_off: offset em minutos (positivo a Este, negativo a Oeste)
 */
export default function TimezoneCookie() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMin = -new Date().getTimezoneOffset();
      document.cookie = `fp_tz=${encodeURIComponent(tz)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.cookie = `fp_tz_off=${offsetMin}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, []);
  return null;
}
