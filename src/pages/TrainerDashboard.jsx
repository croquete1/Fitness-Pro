
// src/pages/TrainerDashboard.jsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { Loader2, Users, FileText, Calendar } from 'lucide-react'

export default function TrainerDashboard() {
  const [trainerData, setTrainerData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        setTrainerData({ name: user.displayName || user.email })
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
      <h1 className="text-3xl font-bold mb-4">💪 Dashboard do Personal Trainer</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-lg font-semibold">Clientes</p>
              <p className="text-sm text-muted">Gerir e monitorizar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-lg font-semibold">Planos de treino</p>
              <p className="text-sm text-muted">Atualizações recentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-lg font-semibold">Agenda</p>
              <p className="text-sm text-muted">Sessões programadas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
