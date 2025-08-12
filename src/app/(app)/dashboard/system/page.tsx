// src/app/(app)/dashboard/system/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const [users, sessions] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.session.count().catch(() => 0),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sistema</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white/60 p-4 dark:bg-neutral-900/60">
          <div className="text-sm opacity-70">Utilizadores</div>
          <div className="text-3xl font-bold">{users}</div>
        </div>
        <div className="rounded-xl border bg-white/60 p-4 dark:bg-neutral-900/60">
          <div className="text-sm opacity-70">Sessões</div>
          <div className="text-3xl font-bold">{sessions}</div>
        </div>
        <div className="rounded-xl border bg-white/60 p-4 dark:bg-neutral-900/60">
          <div className="text-sm opacity-70">Versão</div>
          <div className="text-3xl font-bold">v0.1.0</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white/60 p-4 dark:bg-neutral-900/60">
        <div className="text-sm opacity-70 mb-2">Ambiente</div>
        <pre className="text-xs opacity-80">
{`NODE_ENV: ${process.env.NODE_ENV}
NEXT_RUNTIME: node
`}
        </pre>
      </div>
    </div>
  );
}
