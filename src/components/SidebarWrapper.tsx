import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SidebarClient, { RawUser } from "./SidebarClient";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = {
    id: (session.user as any).id as string,
    name: session.user.name ?? null,
    email: session.user.email!,
    role: (session.user as any).role as RawUser["role"],
  } satisfies RawUser;

  return <SidebarClient user={user} />;
}
