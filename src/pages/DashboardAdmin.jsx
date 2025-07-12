
export default function DashboardAdmin() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard do Administrador</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Utilizadores</div>
          <div className="stat-value text-primary">1254</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Receita Mensal</div>
          <div className="stat-value text-secondary">€4.520</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Relatórios ativos</div>
          <div className="stat-value text-accent">8</div>
        </div>
      </div>
    </div>
  )
}
