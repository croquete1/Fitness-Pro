// src/app/(app)/dashboard/admin/system/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const [users, sessions, pending] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.user.count({ where: { status: "PENDING" as any } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Sistema</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card/60 p-4 backdrop-blur">
          <p className="text-sm text-muted-foreground">Utilizadores</p>
          <p className="mt-1 text-3xl font-bold">{users}</p>
        </div>
        <div className="rounded-2xl border bg-card/60 p-4 backdrop-blur">
          <p className="text-sm text-muted-foreground">Sessões</p>
          <p className="mt-1 text-3xl font-bold">{sessions}</p>
        </div>
        <div className="rounded-2xl border bg-card/60 p-4 backdrop-blur">
          <p className="text-sm text-muted-foreground">Pendentes de aprovação</p>
          <p className="mt-1 text-3xl font-bold">{pending}</p>
        </div>
      </div>
      <div className="rounded-2xl border p-4">
        <h2 className="mb-2 text-base font-medium">Estado</h2>
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          <li>Base de dados online</li>
          <li>Jobs de limpeza de sessão (a cargo do NextAuth / adaptador)</li>
          <li>Backups via fornecedor (Supabase).</li>
        </ul>
      </div>
    </div>
  );
}
