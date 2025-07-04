export function AdminDashboard() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">Gestão</h2>
        <ul className="list-disc list-inside">
          <li>Lista de Personal Trainers</li>
          <li>Lista de Clientes</li>
          <li>Relatórios e Estatísticas do sistema</li>
        </ul>
      </section>
    </div>
  );
}

export function TrainerDashboard() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Painel do Personal Trainer</h1>
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Clientes Ativos</h2>
        <p className="text-sm">Visualize e acompanhe os treinos, planos e progresso dos seus alunos.</p>
      </section>
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Resumo de Chats</h2>
        <p className="text-sm">Converse diretamente com seus clientes.</p>
      </section>
    </div>
  );
}

export function ClienteDashboard() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Meu Treino</h2>
        <ul className="list-disc list-inside text-sm">
          <li>Exercícios com nome, séries e descanso</li>
        </ul>
      </section>
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Mensagens com Personal</h2>
        <p className="text-sm">Acesse o histórico de conversas</p>
      </section>
    </div>
  );
}
