
// src/pages/TrainerDashboard.jsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { Loader2 } from 'lucide-react'

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
      <h1 className="text-2xl font-bold">Dashboard do Personal Trainer</h1>
      <Card>
        <CardContent>
          <p>Olá, {trainerData?.name || 'trainer'}!</p>
          <p>Aqui você poderá acompanhar os treinos dos seus clientes e atualizar planos personalizados.</p>
        </CardContent>
      </Card>
    </div>
  )
}