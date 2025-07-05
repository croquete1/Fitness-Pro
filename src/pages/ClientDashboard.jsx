// src/pages/ClientDashboard.jsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { Bell, CalendarCheck, Dumbbell } from 'lucide-react'

export default function ClientDashboard() {
  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        setClientData({ name: user.displayName || user.email })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🏋️ Dashboard do Cliente</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <Dumbbell className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-lg font-semibold">Treino</p>
              <p className="text-sm text-muted">Plano personalizado</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <CalendarCheck className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-lg font-semibold">Progresso</p>
              <p className="text-sm text-muted">Acompanhamento semanal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <Bell className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-lg font-semibold">Notificações</p>
              <p className="text-sm text-muted">Atualizações importantes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
