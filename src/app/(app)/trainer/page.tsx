export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Área do Treinador</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="font-medium">Resumo</h2>
          <p className="text-sm opacity-70">Conteúdo reservado a TRAINER e ADMIN.</p>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-medium">Próximos passos</h2>
          <ul className="list-disc pl-5 text-sm opacity-80">
            <li>Agenda de sessões</li>
            <li>Gestão de clientes</li>
            <li>Aprovação de treinos</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
