// src/pages/AdminDashboard.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Users, Bell, Settings } from 'lucide-react'
import { useAuthRole } from '../contexts/authRoleContext'
import { useNavigate } from 'react-router-dom'

const data = [
  { name: 'Seg', users: 20 },
  { name: 'Ter', users: 40 },
  { name: 'Qua', users: 35 },
  { name: 'Qui', users: 50 },
  { name: 'Sex', users: 45 },
  { name: 'Sáb', users: 25 },
  { name: 'Dom', users: 30 },
]

export default function AdminDashboard() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        <Button onClick={handleLogout} variant="outline" className="flex gap-2">
          <LogOut className="w-4 h-4" /> Terminar sessão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Utilizadores ativos</p>
              <p className="text-2xl font-bold">125</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Notificações</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Bell className="w-6 h-6 text-yellow-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Configurações</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <Settings className="w-6 h-6 text-gray-500" />
          </CardContent>
        </Card>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Atividade semanal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
