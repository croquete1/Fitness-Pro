function DashboardTrainer() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Personal Trainer!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">👥 Total de alunos: 12</div>
        <div className="bg-white p-6 rounded shadow">📅 Sessões marcadas hoje: 3</div>
        <div className="bg-white p-6 rounded shadow">📨 Mensagens por responder: 5</div>
      </div>
    </div>
  );
}

export default DashboardTrainer;
