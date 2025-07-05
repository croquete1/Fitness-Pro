// src/pages/ClientDashboard.jsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getAuth } from 'firebase/auth'
import { Loader2 } from 'lucide-react'

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
      <h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
      <Card>
        <CardContent>
          <p>Bem-vindo, {clientData?.name || 'cliente'}!</p>
          <p>Aqui irá visualizar planos de treino, evolução e recomendações personalizadas.</p>
        </CardContent>
      </Card>
    </div>
  )
}
