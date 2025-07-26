// lib/auth.ts (server-side)
// next/headers é válido apenas em Server Components
import { cookies } from "next/headers";

export function getUserRole(): string | null {
  return cookies().get("role")?.value || null;
}

export function isAuthenticated(): boolean {
  return !!getUserRole();
}

// se precisar de um hook client-side, você mesmo pode implementar:
// export function useSession() { ... }
