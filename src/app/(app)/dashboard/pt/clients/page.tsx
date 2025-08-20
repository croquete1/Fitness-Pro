import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientsPtPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <div className="card p-4">
        <p>A pesquisa de clientes está no header. Lista em breve…</p>
      </div>
    </section>
  );
}
