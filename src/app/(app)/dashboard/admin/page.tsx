export const dynamic = "force-dynamic";

export default function AdminHubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Administração</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Aprovações", href: "/dashboard/admin/approvals" },
          { title: "Utilizadores", href: "/dashboard/admin/users" },
          { title: "Atribuições (Roster)", href: "/dashboard/admin/roster" },
          { title: "Exercícios", href: "/dashboard/admin/exercises" },
          { title: "Templates", href: "/dashboard/admin/plans" },
          { title: "Relatórios", href: "/dashboard/reports" },
          { title: "Sistema", href: "/dashboard/system" },
          { title: "Logs", href: "/dashboard/system/logs" },
        ].map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="rounded-2xl border bg-white/70 dark:bg-zinc-900/50 backdrop-blur p-5
                       hover:shadow-lg transition group"
          >
            <div className="text-sm text-zinc-500">{c.title}</div>
            <div className="mt-2 text-indigo-600 group-hover:underline">Abrir</div>
          </a>
        ))}
      </div>
    </div>
  );
}
