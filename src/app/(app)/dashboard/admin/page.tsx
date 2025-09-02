// src/app/(app)/dashboard/admin/page.tsx
import MobileTopBar from '@/components/layout/MobileTopBar';
// … mantém os teus imports atuais (cards, gráficos, etc.)

export default async function AdminDashboardPage() {
  // … mantém o fetch dos teus números (clients, trainers, admins, sessions)

  return (
    <>
      {/* Top bar só no mobile */}
      <MobileTopBar title="Dashboard" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <header className="hidden md:flex items-end justify-between pt-6 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Boa noite, Admin 👋</h1>
          {/* ações do desktop (se existirem) */}
        </header>

        {/* KPIs em grelha (2 col no mobile, 4 no desktop) */}
        <section
          className="
            grid grid-cols-2 gap-3
            sm:gap-4
            md:grid-cols-4 md:gap-5
          "
        >
          {/* Usa o teu <AdminCountCard/> — só ajustei paddings via className */}
          <AdminCountCard className="p-3 sm:p-4" title="Clientes" value={clientsCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Treinadores" value={trainersCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Admins" value={adminsCount} />
          <AdminCountCard className="p-3 sm:p-4" title="Sessões (próx. 7d)" value={next7DaysSessions} />
        </section>

        {/* Gráficos/listas empilhados no mobile */}
        <section className="mt-5 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Tendência ocupa 12 col no mobile, 8 no desktop */}
          <div className="md:col-span-8">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Tendência de sessões (7 dias)</h2>
              {/* o teu gráfico aqui */}
              <SessionsTrendChart />
            </div>
          </div>

          {/* Panel lateral (últimas ações, por ex.) ocupa 4 col no desktop */}
          <aside className="md:col-span-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Últimas atividades</h2>
              <RecentActivityList />
            </div>
          </aside>
        </section>

        {/* Safe bottom spacing p/ iPhone */}
        <div className="h-[env(safe-area-inset-bottom)] md:h-0" />
      </div>
    </>
  );
}