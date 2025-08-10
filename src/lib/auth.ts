import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { Role } from "@prisma/client";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    id: (session.user as any).id as string,
    name: session.user.name ?? session.user.email ?? "",
    email: session.user.email ?? undefined,
    role: ((session.user as any).role as Role) ?? "CLIENT",
  };
}
