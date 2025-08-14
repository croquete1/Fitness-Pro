// src/lib/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <- garante que exportas authOptions em src/lib/auth.ts
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user as { id?: string; name?: string | null; email?: string | null; role?: Role } | undefined;

  if (!u?.id) return null;

  return {
    id: u.id,
    name: u.name ?? u.email ?? "",
    email: u.email ?? undefined,
    role: (u.role ?? "CLIENT") as Role,
  };
}
