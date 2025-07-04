import { useAuthRole } from '../contexts/authRoleContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Users, ShieldCheck, BarChart, LogOut, LayoutDashboard } from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md p-4 hidden md:flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-blue-50">
            <LayoutDashboard className="w-4 h-4 text-gray-600" /> Dashboard
          </button>
          <button onClick={() => navigate('/admin/trainers')} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-blue-50">
            <Users className="w-4 h-4 text-blue-600" /> Personal Trainers
          </button>
          <button onClick={() => navigate('/admin/clients')} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-blue-50">
            <Users className="w-4 h-4 text-emerald-600" /> Clientes
          </button>
          <button onClick={() => navigate('/admin/logs')} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-blue-50">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> Logs
          </button>
          <button onClick={() => navigate('/admin/stats')} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-blue-50">
            <BarChart className="w-4 h-4 text-orange-500" /> Estatísticas
          </button>
        </nav>
        <hr className="my-4" />
        <button onClick={logout} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6 md:hidden">
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  )
}
