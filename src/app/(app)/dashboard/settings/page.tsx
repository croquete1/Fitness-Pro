import type { Metadata } from "next";

export const metadata: Metadata = { title: "Definições" };

export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Definições</h1>
      <div className="card p-4">
        <p>Preferências da conta e da aplicação.</p>
      </div>
    </section>
  );
}
