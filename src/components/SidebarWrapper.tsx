import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarClient from "./SidebarClient";

export default async function SidebarWrapper() {
  const session = await getServerSession(authOptions);
  return <SidebarClient user={session?.user ?? null} />;
}
