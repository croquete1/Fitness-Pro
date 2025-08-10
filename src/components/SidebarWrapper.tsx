// src/components/SidebarWrapper.tsx
import SidebarClient from "./SidebarClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Role } from "@prisma/client";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role; // "ADMIN" | "TRAINER" | "CLIENT"
};

export default async function SidebarWrapper({ user }: { user?: RawUser }) {
  let u = user;

  if (!u) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      u = {
        id: (session.user as any).id as string,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        role: ((session.user as any).role ?? "CLIENT") as Role,
      };
    }
  }

  // Em último caso, mostra a sidebar com um utilizador “anónimo” CLIENT
  const safeUser =
    u ?? ({ id: "anon", role: "CLIENT" } as unknown as RawUser);

  return <SidebarClient user={safeUser} />;
}
