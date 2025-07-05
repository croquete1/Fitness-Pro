// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { Loader2, Users, ClipboardList, BellRing } from 'lucide-react'

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        setAdminData({ name: user.displayName || user.email })
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
      <h1 className="text-3xl font-bold mb-4">🛠️ Dashboard do Administrador</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-lg font-semibold">Utilizadores</p>
              <p className="text-sm text-muted">Gerir contas e permissões</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <ClipboardList className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-lg font-semibold">Relatórios</p>
              <p className="text-sm text-muted">Análises e métricas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <BellRing className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-lg font-semibold">Notificações</p>
              <p className="text-sm text-muted">Mensagens e alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
