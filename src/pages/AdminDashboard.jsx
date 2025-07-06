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
import {
  DASHBOARD_LABELS,
  DASHBOARD_ROUTES
} from '@/router/routes.config'

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
    <div className="min-h-screen bg-gray-50 p-4 md:pl-56">
      <div className="sticky top-0 z-10 mb-6 bg-white shadow px-4 py-3 font-bold text-xl border-b">
        {DASHBOARD_LABELS.title}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.users}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.usersDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>

        <Card className={trainerCount > 10 ? 'bg-green-50' : 'bg-gray-100'}>
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.trainers}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.trainersDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{trainerCount}</p>
          </CardContent>
        </Card>

        <Card className={pendingRequests > 5 ? 'bg-red-50' : 'bg-yellow-50'}>
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.pending}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.pendingDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequests}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-100">
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.feedback}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.feedbackDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{feedbacks}</p>
          </CardContent>
        </Card>

        <Card className={notifications > 5 ? 'bg-yellow-100' : 'bg-green-50'}>
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.notifications}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.notificationsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{notifications}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{DASHBOARD_LABELS.activity}</CardTitle>
            <CardDescription>{DASHBOARD_LABELS.activityDesc}</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
