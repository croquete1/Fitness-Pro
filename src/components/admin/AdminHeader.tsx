import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function AdminHeader() {
  const session = await getServerSession(authOptions);
  const name =
    (session?.user?.name as string | null) ??
    (session?.user?.email as string | null) ??
    "Admin";

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">Administração</span>
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-sm">{name}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
