// src/hooks/useClientDashboard.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function useClientDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    workoutCount: 0,
    completedSessions: 0,
    upcomingSessions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!user) return
    async function fetchStats() {
      try {
        const workoutsQ = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid),
        )
        const workoutsSnap = await getDocs(workoutsQ)

        const sessionsQ = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid),
        )
        const sessionsSnap = await getDocs(sessionsQ)
        const allSessions = sessionsSnap.docs.map((d) => d.data())
        const completed = allSessions.filter((s) => s.status === 'completed').length
        const upcoming  = allSessions.filter((s) => s.date.toDate() > new Date()).length

        setStats({
          workoutCount: workoutsSnap.size,
          completedSessions: completed,
          upcomingSessions: upcoming,
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  return { stats, loading, error }
}
