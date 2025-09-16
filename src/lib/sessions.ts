// src/lib/sessions.ts
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

/**
 * Representa o utilizador autenticado devolvido pelo servidor,
 * já normalizado para o nosso enum canónico: "ADMIN" | "PT" | "CLIENT".
 */
export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: AppRole;
};

/**
 * Lê a sessão no servidor e devolve um objeto SessionUser normalizado.
 * - Usa o session-bridge (JWT) para funcionar bem no App Router.
 * - Converte a role para "ADMIN" | "PT" | "CLIENT".
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSessionUserSafe();
  const u = session?.user;

  const id = u?.id ?? null;
  if (!id) return null;

  const role = (toAppRole(u?.role) ?? 'CLIENT') as AppRole;

  return {
    id: String(id),
    name: u?.name ?? null,
    email: u?.email ?? null,
    role,
  };
}

/**
 * Atalho prático quando só precisas do role.
 */
export async function getSessionRole(): Promise<AppRole | null> {
  const u = await getSessionUser();
  return u?.role ?? null;
}
