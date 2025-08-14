// src/lib/auth.ts
import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
// Mantém a tua configuração real no ficheiro abaixo:
import { authOptions as _authOptions } from "./authOptions";

// Re-exporta para consumo pelas rotas e restante código
export const authOptions = _authOptions;

export type SessionUser = {
  id: string;
  name: string;
  email?: string | null;
  role: Role;
};

// Helper opcional (podes usar em server actions)
export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);

  // Se tiveres augmentation em src/types/next-auth.d.ts, isto já deverá estar tipado.
  // Mantemos defensivo para não quebrar a build.
  const user = session?.user as Partial<SessionUser> | undefined;

  if (!user?.id) return null;

  return {
    id: user.id,
    name: (user.name ?? user.email ?? "") as string,
    email: user.email ?? undefined,
    role: (user.role ?? "CLIENT") as Role,
  };
}
