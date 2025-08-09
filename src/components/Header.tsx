import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const name =
    (session?.user?.name as string | null) ??
    (session?.user?.email as string | null) ??
    "Utilizador";

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span className="text-sm text-gray-600">Dashboard</span>
      <div className="flex items-center gap-3">
        <span className="text-sm">{name}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
