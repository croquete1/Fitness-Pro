import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toAppRole, type AppRole } from "@/lib/roles";

/**
 * Representa o utilizador autenticado que regressamos do servidor,
 * com o nosso enum canónico de roles: "admin" | "pt" | "client".
 */
export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: AppRole;
};

/**
 * Lê a sessão no servidor e devolve um objeto SessionUser normalizado.
 * - Não depende do enum Role do Prisma (MAIÚSCULAS).
 * - Converte qualquer valor de role para "admin" | "pt" | "client".
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user as
    | { id?: string; name?: string | null; email?: string | null; role?: unknown }
    | undefined;

  const id = u?.id ?? null;
  if (!id) return null;

  return {
    id: String(id),
    name: u?.name ?? null,
    email: u?.email ?? null,
    role: toAppRole(u?.role),
  };
}

/**
 * Atalho prático quando só precisas do role.
 */
export async function getSessionRole(): Promise<AppRole | null> {
  const u = await getSessionUser();
  return u?.role ?? null;
}
