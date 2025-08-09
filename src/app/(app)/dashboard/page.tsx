import dynamic from "next/dynamic";
import ClientesTable from "@/components/dashboard/ClientesTable";
import type { Cliente } from "@/components/dashboard/columnsClientes";

const LineChart = dynamic(() => import("@/components/dashboard/LineChart"), { ssr: false });

export default function DashboardPage() {
  // (Aqui em produção vai buscar dados via Prisma. Por agora, sample.)
  const data: Cliente[] = [
    { nome: "Ana Silva", email: "ana@exemplo.com", estado: "ativo" },
    { nome: "Bruno Costa", email: "bruno@exemplo.com", estado: "pendente" },
    { nome: "Carla Dias", email: "carla@exemplo.com", estado: "inativo" },
  ];

  const chart = [
    { name: "Jan", value: 12 },
    { name: "Fev", value: 18 },
    { name: "Mar", value: 9 },
  ];

  return (
    <main className="p-6 space-y-6">
      <section>
        <h1 className="mb-2 text-2xl font-semibold">Clientes</h1>
        <ClientesTable data={data} />
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Evolução</h2>
        <LineChart data={chart} height={260} />
      </section>
    </main>
  );
}
