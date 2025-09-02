// src/app/(app)/dashboard/admin/page.tsx
import MobileTopBar from '@/components/layout/MobileTopBar';
import AdminCountCard from '@/components/dashboard/AdminCountCard';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// Se já tens estes componentes, mantém os teus imports.
// import SessionsTrendChart from '@/components/...';
// import RecentActivityList from '@/components/...';

export default async function AdminDashboardPage() {
  // Valores por defeito
  let clientsCount = 0;
  let trainersCount = 0;
  let adminsCount = 0;
  let next7DaysSessions = 0;

  // KPIs via Prisma (com try/catch para não rebentar o build)
  try {
    const [c, t, a] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);
    clientsCount = c;
    trainersCount = t;
    adminsCount = a;
  } catch {
    // deixa os defaults a 0 se a tabela/enum não existir num ambiente
  }

  // Sessões dos próximos 7 dias: tenta via SQL genérico; se não existir tabela, fica 0
  try {
    const rows = await prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(*)::int AS c
      FROM sessions
      WHERE start_at >= NOW() AND start_at < NOW() + INTERVAL '7 days'
    `;
    next7DaysSessions = rows?.[0]?.c ?? 0;
  } catch {
    // ignora se a tabela não existir
  }

  return (
    <>
      {/* Top bar só no mobile */}
      <MobileTopBar title="Dashboard" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header (desktop) */}
        <header className="hidden md:flex items-end justify-between pt-6 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Boa noite, Admin 👋</h1>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          <AdminCountCard className="p-3 sm:p-4" title="Clientes" value={clientsCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Treinadores" value={trainersCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Admins" value={adminsCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Sessões (próx. 7d)" value={next7DaysSessions} />
        </section>

        {/* Gráficos/listas */}
        <section className="mt-5 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-8">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Tendência de sessões (7 dias)</h2>
              {/* Coloca aqui o teu componente real */}
              {/* <SessionsTrendChart /> */}
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Últimas atividades</h2>
              {/* <RecentActivityList /> */}
            </div>
          </aside>
        </section>

        <div className="h-[env(safe-area-inset-bottom)] md:h-0" />
      </div>
    </>
  );
}