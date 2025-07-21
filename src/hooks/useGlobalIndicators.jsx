import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useGlobalIndicators() {
  const [indicators, setIndicators] = useState({
    completedPct: 0,
    avgMood: 0,
    totalLoadByCategory: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(collection(db, 'sessions'))
        const all = snap.docs.map((d) => d.data())
        const planned = all.length
        const completed = all.filter((s) => s.status === 'completed').length
        const moodSum = all.reduce((sum, s) => sum + (s.moodRating || 0), 0)
        const catLoad = {}
        all.forEach((s) => {
          catLoad[s.category] = (catLoad[s.category] || 0) + (s.totalLoad || 0)
        })
        setIndicators({
          completedPct: planned ? (completed / planned) * 100 : 0,
          avgMood: planned ? moodSum / planned : 0,
          totalLoadByCategory: catLoad,
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { indicators, loading, error }
}
