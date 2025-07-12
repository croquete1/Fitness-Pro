
export default function DashboardTrainer() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard do Treinador</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Total de alunos</div>
          <div className="stat-value text-primary">12</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Sessões hoje</div>
          <div className="stat-value text-secondary">3</div>
        </div>
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">Mensagens por responder</div>
          <div className="stat-value text-accent">5</div>
        </div>
      </div>
    </div>
  )
}
