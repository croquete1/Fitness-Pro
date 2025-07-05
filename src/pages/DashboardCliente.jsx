// src/pages/DashboardCliente.jsx
import { useAuthRole } from '../contexts/authRoleContext'

export default function DashboardCliente() {
  const { user } = useAuthRole()
  if (!user) return null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Olá, {user.nome || user.email}</h1>
      <p className="text-gray-600 mt-2">Bem-vindo à sua área de cliente.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Seus planos ativos</h2>
          <p>📋 Nenhum plano disponível.</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Mensagens recentes</h2>
          <p>✉️ Nenhuma mensagem nova.</p>
        </div>
      </div>
    </div>
  )
}
