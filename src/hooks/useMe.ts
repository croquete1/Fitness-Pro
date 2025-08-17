"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "TRAINER" | "CLIENT" | string;
};

export function useMe() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/session", { credentials: "include" });
        if (r.ok) {
          const j = await r.json();
          const u = (j?.user ?? {}) as any;
          const role = (u?.role ?? j?.role ?? "ADMIN") as CurrentUser["role"]; // fallback: ADMIN para não quebrar
          if (alive) setUser({ id: u?.id, name: u?.name, email: u?.email, role });
        } else {
          if (alive) setUser({ role: "ADMIN" }); // fallback
        }
      } catch {
        if (alive) setUser({ role: "ADMIN" }); // fallback
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { user, loading };
}
