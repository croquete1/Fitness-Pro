// src/lib/auth.ts
// Re-export do authOptions + helpers de sessão (compatível com importações antigas)
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { Role, Status } from "@prisma/client";

export { authOptions };

/** Shape normalizado do utilizador da sessão */
export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  status?: Status;
};

/** Devolve o utilizador da sessão ou null (server-side) */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const u = session.user as any;
  return {
    id: (u.id as string) ?? "",
    name: session.user.name ?? session.user.email ?? "",
    email: session.user.email ?? undefined,
    role: (u.role as Role) ?? "CLIENT",
    status: u.status as Status | undefined,
  };
}

/** Acesso direto à sessão NextAuth (server-side) */
export function getServerAuthSession() {
  return getServerSession(authOptions);
}
