import type { Metadata } from "next";

export const metadata: Metadata = { title: "Saúde do Sistema" };

export default function SystemHealthPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Saúde do Sistema</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">API: OK</div>
        <div className="card p-4">DB: OK</div>
        <div className="card p-4">Jobs: OK</div>
      </div>
    </section>
  );
}
