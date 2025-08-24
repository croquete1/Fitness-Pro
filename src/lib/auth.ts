// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions"; // mantém a tua config centralizada
import { Role, Status } from "@prisma/client";

export { authOptions }; // permite importar de "@/lib/auth" ou "@/lib/authOptions"

export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  status: Status;
};

/**
 * Lê o utilizador da sessão (App Router / server-side) e normaliza
 * role/status para os enums do Prisma, evitando mismatches de tipo.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const raw = session?.user as any;
  if (!raw) return null;

  // Coerção segura para os enums do Prisma
  const role: Role = (Object.values(Role) as string[]).includes(String(raw.role))
    ? (raw.role as Role)
    : Role.CLIENT;

  const status: Status = (Object.values(Status) as string[]).includes(String(raw.status))
    ? (raw.status as Status)
    : Status.ACTIVE;

  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.email ?? ""),
    email: raw.email ?? undefined,
    role,
    status,
  };
}
