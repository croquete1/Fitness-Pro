// src/components/SidebarWrapper.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SidebarClient, { RawUser } from "./SidebarClient";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id: string; name?: string | null; email?: string | null; role?: "ADMIN" | "TRAINER" | "CLIENT" }
    | undefined;

  if (!user?.id || !user.role) redirect("/login");

  const safeUser: RawUser = {
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    role: user.role,
  };

  return <SidebarClient user={safeUser} />;
}
