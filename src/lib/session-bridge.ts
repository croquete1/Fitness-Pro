// src/lib/session-bridge.ts
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toAppRole, type AppRole } from "@/lib/roles";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

/**
 * Devolve o utilizador da sessão (ou null).
 * Usa NextAuth (App Router) com as tuas authOptions.
 */
export async function getSessionUserSafe(): Promise<SessionUser | null> {
  let session: Session | null = null;

  // Primeiro tenta com as opções definidas (normal em App Router)
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Fallback defensivo: alguns ambientes permitem chamar sem options
    try {
      session = await (getServerSession as any)();
    } catch {
      session = null;
    }
  }

  const u = session?.user as any;
  if (!u?.id) return null;

  return {
    id: String(u.id),
    email: u.email ?? null,
    name: u.name ?? null,
    role: (u.role ?? null) as string | null,
  };
}

/** Devolve o role normalizado da sessão (ADMIN | PT | CLIENT) ou null. */
export async function getSessionRole(): Promise<AppRole | null> {
  const u = await getSessionUserSafe();
  return u?.role ? toAppRole(u.role) : null;
}