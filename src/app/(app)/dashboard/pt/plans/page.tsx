import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planos" };

export default function PlansPtPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Planos</h1>
      <div className="card p-4">Gestão de planos em breve…</div>
    </section>
  );
}
