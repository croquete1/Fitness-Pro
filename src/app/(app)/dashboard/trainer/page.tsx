// src/app/(app)/dashboard/trainer/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import SessionScheduler from "@/components/trainer/SessionScheduler";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TrainerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const meId = (session.user as any).id as string;
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";

  const where = role === "ADMIN" ? {} : { trainerId: meId };

  const upcoming = await prisma.session.findMany({
    where: { ...where, scheduledAt: { gte: new Date() } },
    include: {
      client: { select: { name: true, email: true } },
      trainer: { select: { name: true, email: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 8,
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">PT · Agendamento</h1>
        <Link href="/dashboard/sessions" className="text-sm underline underline-offset-4">
          Ver todas as sessões
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-medium mb-3">Criar sessão</h2>
          <SessionScheduler />
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-medium mb-3">Próximas sessões</h2>
          <ul className="space-y-3">
            {upcoming.length === 0 && (
              <li className="text-sm text-muted-foreground">Sem sessões futuras.</li>
            )}
            {upcoming.map((s) => (
              <li key={s.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">
                  {new Date(s.scheduledAt).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Treinador: {s.trainer.name ?? s.trainer.email} · Cliente:{" "}
                  {s.client.name ?? s.client.email}
                </div>
                {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
