export const dynamic = "force-dynamic";

import Link from "next/link";
import { ShieldCheck, Users, ClipboardList } from "lucide-react";

export default function AdminHome() {
  return (
    <main className="p-6 space-y-6">
      <div className="rounded-3xl border bg-gradient-to-br from-amber-500/10 via-background to-transparent p-6">
        <h1 className="text-2xl font-semibold">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de utilizadores, sessões e aprovações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminCard
          href="/dashboard/admin/approvals"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Aprovações de conta"
          desc="Aprovar/rejeitar registos pendentes."
        />
        <AdminCard
          href="/dashboard/admin/users"
          icon={<Users className="h-5 w-5" />}
          title="Utilizadores"
          desc="Listar/editar perfis."
        />
        <AdminCard
          href="/dashboard/admin/sessions"
          icon={<ClipboardList className="h-5 w-5" />}
          title="Sessões (todos)"
          desc="Ver agenda global por treinador."
        />
      </div>
    </main>
  );
}

function AdminCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="relative block overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2 text-sm opacity-80">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}
