import { useAuthRole } from '../contexts/authRoleContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, ShieldCheck, BarChart, LogOut, LayoutDashboard, Bell, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  const navItem = (path, icon, label) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full justify-start hover:bg-blue-100 ${pathname === path ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
    >
      {icon} <span>{label}</span>
    </button>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col border-r">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">FitnessPro</h1>
          <p className="text-sm text-gray-500 mt-1">Admin: {user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItem('/admin', <LayoutDashboard className="w-5 h-5" />, 'Dashboard')}
          {navItem('/admin/trainers', <Users className="w-5 h-5" />, 'Personal Trainers')}
          {navItem('/admin/clients', <Users className="w-5 h-5" />, 'Clientes')}
          {navItem('/admin/logs', <ShieldCheck className="w-5 h-5" />, 'Logs')}
          {navItem('/admin/stats', <BarChart className="w-5 h-5" />, 'Estatísticas')}
          {navItem('/admin/notifications', <Bell className="w-5 h-5" />, 'Notificações')}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-1">Painel de Administração</h2>
          <p className="text-gray-500 text-sm">Resumo geral do sistema e acessos rápidos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white shadow rounded-lg p-6">
            <p className="text-sm">Clientes</p>
            <p className="text-3xl font-bold">512</p>
          </div>
          <div className="bg-gradient-to-tr from-green-500 to-green-700 text-white shadow rounded-lg p-6">
            <p className="text-sm">Personal Trainers</p>
            <p className="text-3xl font-bold">38</p>
          </div>
          <div className="bg-gradient-to-tr from-yellow-500 to-yellow-700 text-white shadow rounded-lg p-6">
            <p className="text-sm">Utilizadores Ativos</p>
            <p className="text-3xl font-bold">134</p>
          </div>
          <div className="bg-gradient-to-tr from-pink-500 to-pink-700 text-white shadow rounded-lg p-6">
            <p className="text-sm">Desempenho</p>
            <p className="text-3xl font-bold">+256%</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div
            onClick={() => navigate('/admin/trainers')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-1">Gestão de Personal Trainers</h3>
            <p className="text-sm text-gray-500">Adicionar, editar ou remover treinadores.</p>
          </div>
          <div
            onClick={() => navigate('/admin/clients')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-1">Gestão de Clientes</h3>
            <p className="text-sm text-gray-500">Ver todos os clientes registados.</p>
          </div>
          <div
            onClick={() => navigate('/admin/stats')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-1">Estatísticas</h3>
            <p className="text-sm text-gray-500">Indicadores de desempenho e relatórios.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Notificações Recentes</h3>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>João Silva criou conta (Cliente)</li>
              <li>Maria Costa submeteu pedido de plano</li>
              <li>Novo personal trainer: Hugo Mendes</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Atividade do Sistema</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>5 planos atualizados hoje</li>
              <li>12 mensagens recebidas</li>
              <li>1 admin fez login</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
