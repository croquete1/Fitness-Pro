import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { useAuthRole } from '../contexts/authRoleContext'

const lineData = [
  { name: 'Seg', users: 24 },
  { name: 'Ter', users: 31 },
  { name: 'Qua', users: 45 },
  { name: 'Qui', users: 40 },
  { name: 'Sex', users: 55 },
  { name: 'Sáb', users: 38 },
  { name: 'Dom', users: 20 },
]

const barData = [
  { name: 'Semana 1', novos: 10 },
  { name: 'Semana 2', novos: 14 },
  { name: 'Semana 3', novos: 8 },
  { name: 'Semana 4', novos: 18 },
]

const pieData = [
  { name: 'Clientes', value: 76 },
  { name: 'Personal Trainers', value: 24 },
]

const COLORS = ['#8884d8', '#82ca9d']

export default function AdminStatsPage() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Estatísticas do Sistema</h2>
          <p className="text-gray-500 text-sm">Relatórios visuais e indicadores de atividade</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium">
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-2">Utilizadores Ativos (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#0070f3" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-2">Novos Clientes por Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="novos" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded xl:w-1/2">
        <h3 className="text-lg font-semibold mb-2">Distribuição de Utilizadores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
