// src/app/(app)/dashboard/admin/page.tsx
import MobileTopBar from '@/components/layout/MobileTopBar';
import AdminCountCard from '@/components/dashboard/AdminCountCard'; // ✅ IMPORT NECESSÁRIO

// … mantém os teus imports atuais (gráficos/listas) e o fetch dos números

export default async function AdminDashboardPage() {
  // … mantém o fetch dos teus números (clientsCount, trainersCount, adminsCount, next7DaysSessions)

  return (
    <>
      {/* Top bar só no mobile */}
      <MobileTopBar title="Dashboard" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header */}
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

        {/* Conteúdo */}
        <section className="mt-5 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-8">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Tendência de sessões (7 dias)</h2>
              <SessionsTrendChart />
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Últimas atividades</h2>
              <RecentActivityList />
            </div>
          </aside>
        </section>

        <div className="h-[env(safe-area-inset-bottom)] md:h-0" />
      </div>
    </>
  );
}