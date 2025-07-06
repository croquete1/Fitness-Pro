// src/pages/AdminDashboard.jsx

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Bell, User } from 'lucide-react'

const sampleData = [
  { name: 'Janeiro', users: 30 },
  { name: 'Fevereiro', users: 45 },
  { name: 'Março', users: 60 },
  { name: 'Abril', users: 40 },
  { name: 'Maio', users: 80 },
]

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0)
  const [trainerCount, setTrainerCount] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(5)
  const [feedbacks, setFeedbacks] = useState(3)
  const [notifications, setNotifications] = useState(7)

  useEffect(() => {
    setUserCount(123)
    setTrainerCount(12)
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-2xl font-bold">Bem-vindo, Admin 👋</div>
          <p className="text-sm text-gray-500">Painel geral de estatísticas</p>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-500 w-5 h-5 cursor-pointer" />
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white shadow rounded-2xl p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-600 text-sm">Total de Utilizadores</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-blue-600">{userCount}</CardContent>
        </Card>

        <Card className="bg-white shadow rounded-2xl p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-600 text-sm">Personal Trainers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-600">{trainerCount}</CardContent>
        </Card>

        <Card className="bg-white shadow rounded-2xl p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-600 text-sm">Pedidos Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-red-500">{pendingRequests}</CardContent>
        </Card>

        <Card className="bg-white shadow rounded-2xl p-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-600 text-sm">Notificações</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-yellow-500">{notifications}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white shadow rounded-2xl col-span-2 p-6">
          <CardHeader className="mb-4">
            <CardTitle className="text-lg font-semibold">Atividade Mensal</CardTitle>
            <CardDescription className="text-sm text-gray-500">Novos utilizadores por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-2xl p-6">
          <CardHeader className="mb-4">
            <CardTitle className="text-lg font-semibold">Feedback</CardTitle>
            <CardDescription className="text-sm text-gray-500">Mensagens dos utilizadores</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">{feedbacks}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
