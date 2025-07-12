
export default function DashboardCliente() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard do Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Próximo treino</div>
          <div className="stat-value text-primary">Amanhã</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Calorias gastas</div>
          <div className="stat-value text-secondary">2300</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Plano alimentar</div>
          <div className="stat-value text-accent">Ativo</div>
        </div>
      </div>
    </div>
  )
}
