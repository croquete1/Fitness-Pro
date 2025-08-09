import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: "cliente" | "pt" | "admin" }).role !== "admin") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
