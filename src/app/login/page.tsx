import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-semibold text-center">Iniciar sessão</h1>
        <LoginForm />
      </div>
    </main>
  );
}
