// lib/auth-server.ts

import { cookies } from "next/headers";

/**
 * getUserRole
 * Lê o cookie "role" no contexto de Server Components / Middleware.
 */
export function getUserRole(): string | null {
  const cookieStore = cookies();
  return cookieStore.get("role")?.value || null;
}

/**
 * isAuthenticated
 * Verifica se o utilizador está autenticado (existe um role válido).
 */
export function isAuthenticated(): boolean {
  return Boolean(getUserRole());
}
