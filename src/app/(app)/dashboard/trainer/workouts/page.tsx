import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/trainer/workouts");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!(role === "ADMIN" || role === "TRAINER")) {
    redirect("/dashboard");
  }

  return (
    <div className="rounded-2xl border p-4 bg-card/50 backdrop-blur">
      <h1 className="mb-4 text-xl font-semibold">Planos de treino</h1>
      {/* Aqui podes renderizar a tua lista de treinos quando a API estiver pronta */}
      <p className="text-sm opacity-70">
        Não existem treinos para apresentar.
      </p>
    </div>
  );
}
