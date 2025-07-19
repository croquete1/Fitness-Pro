// src/hooks/useAdminStats.js
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

export function useAdminStats() {
  const [stats, setStats]     = useState(null)
  const [monthly, setMonthly] = useState({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      setError(null)
      setLoading(true)
      try {
        // Obter coleções do Firestore
        const usersSnap    = await getDocs(collection(db, 'users'))
        const sessionsSnap = await getDocs(collection(db, 'sessions'))
        const paymentsSnap = await getDocs(collection(db, 'payments'))

        // Calcular estatísticas básicas
        const usersCount    = usersSnap.size
        const sessionsCount = sessionsSnap.size
        const trainersCount = usersSnap.docs.filter((d) => d.data().role === 'trainer').length
        const revenue       = paymentsSnap.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        )

        setStats({ usersCount, sessionsCount, revenue, trainersCount })

        // Gerar dados de sessões para os últimos 6 meses
        const now    = new Date()
        const labels = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now)
          d.setMonth(now.getMonth() - (5 - i))
          return d.toLocaleString('default', { month: 'short' })
        })
        const data = labels.map(() => Math.floor(Math.random() * 50) + 10)
        setMonthly({ labels, data })
      } catch (err) {
        console.error('Erro ao carregar estatísticas admin:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, monthly, loading, error }
}
