function DashboardCliente() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Cliente!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">📅 Próximo treino: Amanhã</div>
        <div className="bg-white p-6 rounded shadow">🔥 Calorias gastas esta semana: 2300</div>
        <div className="bg-white p-6 rounded shadow">🥗 Plano alimentar: Ativo</div>
      </div>
    </div>
  );
}

export default DashboardCliente;
