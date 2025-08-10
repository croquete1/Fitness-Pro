// Server Component: obtém sessão e injeta no SidebarClient
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarClient, { RawUser } from "./SidebarClient";
import { redirect } from "next/navigation";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  const sUser = session?.user as any;

  if (!sUser) {
    redirect("/login");
  }

  const user: RawUser = {
    id: sUser.id as string,
    name: sUser.name ?? null,
    email: sUser.email ?? null,
    role: (sUser.role as "ADMIN" | "TRAINER" | "CLIENT") ?? "CLIENT",
  };

  return <SidebarClient user={user} />;
}
