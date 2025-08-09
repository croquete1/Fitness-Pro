"use client";

import DataTable from "./DataTable";
import { columnsClientes, type Cliente } from "./columnsClientes";

export default function ClientesTable({ data }: { data: Cliente[] }) {
  return <DataTable columns={columnsClientes} data={data} initialPageSize={10} />;
}
