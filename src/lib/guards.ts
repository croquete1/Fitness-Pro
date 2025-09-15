import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const user = await getSessionUserSafe();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
