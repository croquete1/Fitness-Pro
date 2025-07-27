"use client";

// lib/auth-client.tsx

import { useState, useEffect } from "react";

export interface Session {
  role: string | null;
  loading: boolean;
}

/**
 * useSession
 * Hook client-side que lê o cookie "role" no browser
 * e expõe o estado de loading enquanto carrega.
 */
export function useSession(): Session {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);
    setRole(match ? decodeURIComponent(match[1]) : null);
    setLoading(false);
  }, []);

  return { role, loading };
}
