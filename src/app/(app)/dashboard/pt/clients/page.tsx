// src/app/(app)/dashboard/pt/clients/page.tsx
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

type SimpleUser = { id: string; name: string | null; email: string };

async function getRoster(trainerId?: string): Promise<SimpleUser[]> {
  const trainerClientModel = (prisma as any).trainerClient;

  // Caminho A: existe modelo TrainerClient -> usar relação direta
  if (trainerClientModel?.findMany) {
    const rows = await trainerClientModel.findMany({
      where: trainerId ? { trainerId } : undefined,
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r: any) => r.client) as SimpleUser[];
  }

  // Caminho B (fallback): derivar por sessões
  if (trainerId) {
    const sessions = await prisma.session.findMany({
      where: { trainerId },
      select: { client: { select: { id: true, name: true, email: true } } },
    });
    const map = new Map<string, SimpleUser>();
    for (const s of sessions) if (s.client) map.set(s.client.id, s.client as SimpleUser);
    return Array.from(map.values());
  }

  // Sem TrainerClient e sem trainerId -> todos os CLIENT
  return prisma.user.findMany({
    where: { role: Role.CLIENT },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export default async function PTClientsPage({
  searchParams,
}: {
  searchParams?: { trainerId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  const meId = (session.user as any).id as string;

  const trainerId = role === "TRAINER" ? meId : searchParams?.trainerId;
  const clients = await getRoster(trainerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">PT / Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {trainerId ? "Clientes atribuídos ao treinador selecionado." : "Todos os clientes (fallback)."}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  Sem clientes atribuídos.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{c.name ?? c.email}</td>
                  <td className="px-4 py-3">{c.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
