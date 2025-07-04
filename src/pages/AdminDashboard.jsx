import { useAuthRole } from '../contexts/authRoleContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Users, ShieldCheck, BarChart } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthRole()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bem-vindo, Administrador</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card onClick={() => navigate('/admin/trainers')} className="cursor-pointer hover:shadow-lg">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h2 className="font-semibold">Personal Trainers</h2>
            <p className="text-sm text-gray-500">Gerir treinadores</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/clients')} className="cursor-pointer hover:shadow-lg">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h2 className="font-semibold">Clientes</h2>
            <p className="text-sm text-gray-500">Gerir clientes registados</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/logs')} className="cursor-pointer hover:shadow-lg">
          <CardContent className="flex flex-col items-center p-4">
            <ShieldCheck className="w-8 h-8 text-purple-600 mb-2" />
            <h2 className="font-semibold">Logs e Segurança</h2>
            <p className="text-sm text-gray-500">Ver histórico de ações</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/admin/stats')} className="cursor-pointer hover:shadow-lg">
          <CardContent className="flex flex-col items-center p-4">
            <BarChart className="w-8 h-8 text-orange-500 mb-2" />
            <h2 className="font-semibold">Estatísticas</h2>
            <p className="text-sm text-gray-500">Análise e relatórios</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
