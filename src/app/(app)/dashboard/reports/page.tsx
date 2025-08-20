import type { Metadata } from "next";

export const metadata: Metadata = { title: "Relatórios" };

export default function ReportsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">Em breve…</div>
        <div className="card p-4">Em breve…</div>
        <div className="card p-4">Em breve…</div>
      </div>
    </section>
  );
}
