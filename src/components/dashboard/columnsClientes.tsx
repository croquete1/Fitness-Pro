"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type Cliente = {
  nome: string;
  email: string;
  estado: "ativo" | "inativo" | "pendente";
};

export const columnsClientes: ColumnDef<Cliente>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      const color =
        v === "ativo"
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
          : v === "pendente"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";

      return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${color}`}>
          {v}
        </span>
      );
    },
  },
];
