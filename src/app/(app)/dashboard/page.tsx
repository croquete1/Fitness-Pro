import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import Reveal from "@/components/anim/Reveal";
import { Stagger } from "@/components/anim/Stagger";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clientes, pts, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <Reveal variant="up">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </Reveal>

      {/* Cards principais com hover + stagger */}
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stagger>
            <Reveal>
              <div className="group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30">
                <div className="text-sm opacity-70">Clientes</div>
                <div className="text-3xl font-bold">{clientes}</div>
              </div>
            </Reveal>

            <Reveal>
              <div className="group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30">
                <div className="text-sm opacity-70">Treinadores</div>
                <div className="text-3xl font-bold">{pts}</div>
              </div>
            </Reveal>

            <Reveal>
              <div className="group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30">
                <div className="text-sm opacity-70">Admins</div>
                <div className="text-3xl font-bold">{admins}</div>
              </div>
            </Reveal>
          </Stagger>
        </div>
      </section>

      {/* Mini agenda / próximos eventos (placeholder de UI) */}
      <Reveal variant="up" delay={120}>
        <div className="rounded-xl border p-4 bg-gradient-to-br from-background to-muted/40 backdrop-blur">
          <div className="mb-2 text-sm opacity-70">Próximas sessões</div>
          <div className="text-sm text-muted-foreground">
            Em breve: mostrar aqui as 3–5 próximas sessões (ligação à API de sessões).
          </div>
        </div>
      </Reveal>
    </main>
  );
}
