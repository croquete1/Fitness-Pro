"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface Props { user: Session["user"] & { role?: string } }

export default function SidebarClient({ user }: Props) {
  return (
    <nav className="h-full p-4">
      <h2 className="text-lg font-bold mb-3">Fitness Pro</h2>
      <ul className="space-y-2 text-gray-700">
        <li><Link href={user.role === "admin" ? "/admin" : "/home"}>Visão Geral</Link></li>
        {user.role === "client" && <li><Link href="/dashboard/workouts">Meus Treinos</Link></li>}
        {user.role === "trainer" && <li><Link href="/trainer/clients">Meus Clientes</Link></li>}
        {user.role === "admin" && (
          <>
            <li><Link href="/admin/users">Contas</Link></li>
            <li><Link href="/admin/assign-clients">Atribuição</Link></li>
          </>
        )}
        <li>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-6 text-left text-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
