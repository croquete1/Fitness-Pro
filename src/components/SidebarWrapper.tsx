import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarClient, { RawUser } from "./SidebarClient";
import { redirect } from "next/navigation";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user: RawUser = {
    id: (session.user as any).id as string,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: (session.user as any).role as RawUser["role"],
  };

  return <SidebarClient user={user} />;
}
