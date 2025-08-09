import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarClient from "./SidebarClient";
import type { SessionUser } from "@/lib/types";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  // O middleware já protege /dashboard, mas garantimos tipagem segura
  const user = (session?.user ?? {}) as Partial<SessionUser>;

  return (
    <SidebarClient
      user={{
        id: user.id ?? "",
        role: (user.role as SessionUser["role"]) ?? "cliente",
        name: user.name ?? null,
        email: user.email,
      }}
    />
  );
}
