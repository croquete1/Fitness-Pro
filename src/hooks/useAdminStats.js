// src/hooks/useAdminStats.js
import { useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs } from 'firebase/firestore'

export function useAdminStats() {
  const [stats, setStats] = useState({
    usersCount: 0,
    sessionsCount: 0,
    trainersCount: 0,
    revenue: 0,
    conversionRate: 0,
  })
  const [monthly, setMonthly] = useState({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Carrega coleções
        const [uSnap, sSnap, pSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'sessions')),
          getDocs(collection(db, 'payments')),
        ])
        const usersCount    = uSnap.size
        const sessionsCount = sSnap.size
        const trainersCount = uSnap.docs.filter(d => d.data().role === 'trainer').length
        const revenue       = pSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0)
        const conversionRate = usersCount > 0
          ? parseFloat(((sessionsCount / usersCount) * 100).toFixed(2))
          : 0

        setStats({ usersCount, sessionsCount, trainersCount, revenue, conversionRate })

        // Gera últimos 6 meses
        const now    = new Date()
        const labels = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now)
          d.setMonth(now.getMonth() - (5 - i))
          return d.toLocaleString('default', { month: 'short' })
        })
        // Usa sessõesCount distribuídas ou dados fictícios
        const data = labels.map((_, i) =>
          Math.floor((sessionsCount / 6) * (i + 1))
        )
        setMonthly({ labels, data })
      } catch (err) {
        console.error(err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, monthly, loading, error }
}
