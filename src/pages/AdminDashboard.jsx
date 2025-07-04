import { useAuthRole } from '../contexts/authRoleContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Users, ShieldCheck, BarChart, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
          <p className="text-gray-500">Bem-vindo, {user.name || user.email}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
          <LogOut className="w-4 h-4" /> Terminar Sessão
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => navigate('/admin/trainers')} className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h2 className="font-semibold">Personal Trainers</h2>
            <p className="text-sm text-gray-500">Gerir treinadores</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/clients')} className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h2 className="font-semibold">Clientes</h2>
            <p className="text-sm text-gray-500">Gerir clientes registados</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/logs')} className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="flex flex-col items-center p-4">
            <ShieldCheck className="w-8 h-8 text-purple-600 mb-2" />
            <h2 className="font-semibold">Logs e Segurança</h2>
            <p className="text-sm text-gray-500">Histórico de ações</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/stats')} className="cursor-pointer hover:shadow-lg transition-all">
          <CardContent className="flex flex-col items-center p-4">
            <BarChart className="w-8 h-8 text-orange-500 mb-2" />
            <h2 className="font-semibold">Estatísticas</h2>
            <p className="text-sm text-gray-500">Análise do sistema</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
