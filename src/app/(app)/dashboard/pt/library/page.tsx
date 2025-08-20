import type { Metadata } from "next";

export const metadata: Metadata = { title: "Biblioteca" };

export default function LibraryPtPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Biblioteca</h1>
      <div className="card p-4">Conteúdos em breve…</div>
    </section>
  );
}
