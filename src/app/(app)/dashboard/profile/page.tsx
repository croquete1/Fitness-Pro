import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Meu perfil</h1>
      <div className="rounded-2xl border p-6 grid gap-2 text-sm">
        <div><span className="opacity-60">Nome:</span> {user.name ?? "-"}</div>
        <div><span className="opacity-60">Email:</span> {user.email}</div>
        <div><span className="opacity-60">Role:</span> {user.role}</div>
      </div>
    </main>
  );
}
