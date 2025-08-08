// src/app/(app)/dashboard/page.tsx
import LineChart, { type DataPoint } from "@/components/dashboard/LineChart";

export default function DashboardPage() {
  const data: DataPoint[] = [
    { name: "Jan", value: 12 },
    { name: "Fev", value: 18 },
    { name: "Mar", value: 9 },
  ];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Evolução</h1>
      <LineChart data={data} height={260} />
    </main>
  );
}
