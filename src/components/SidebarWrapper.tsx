// src/components/SidebarWrapper.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarClient, { type RawUser } from "./SidebarClient";
import { redirect } from "next/navigation";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user: RawUser = {
    id: (session.user as any).id,
    name: session.user.name ?? null,
    email: session.user.email!,
    role: (session.user as any).role as RawUser["role"],
  };

  return <SidebarClient user={user} />;
}
