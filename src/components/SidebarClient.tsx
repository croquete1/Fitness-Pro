"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type UserRole = "cliente" | "pt" | "admin";

export default function SidebarClient() {
  const { data } = useSession();
  const role: UserRole =
    ((data?.user as { role?: UserRole } | undefined)?.role) ?? "cliente";

  return (
    <aside className="w-64 border-r p-4 space-y-4">
      <div className="text-sm opacity-70">
        {data?.user?.email ? `Sessão: ${data.user.email}` : "Não autenticado"}
      </div>

      <nav>
        <ul className="space-y-2 text-gray-700">
          {/* Visão Geral: admin vai para /admin, restantes para /dashboard */}
          <li>
            <Link
              href={role === "admin" ? "/admin" : "/dashboard"}
              className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Visão Geral
            </Link>
          </li>

          {/* Links específicos por papel */}
          {role === "cliente" && (
            <>
              <li>
                <Link
                  href="/dashboard/workouts"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Meus Treinos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/bookings"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Minhas Marcações
                </Link>
              </li>
            </>
          )}

          {role === "pt" && (
            <>
              <li>
                <Link
                  href="/trainer/clients"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Meus Clientes
                </Link>
              </li>
              <li>
                <Link
                  href="/trainer/schedule"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Agenda
                </Link>
              </li>
            </>
          )}

          {role === "admin" && (
            <>
              <li>
                <Link
                  href="/admin/users"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Utilizadores
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="block rounded-md px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Definições
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
