import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useTrainerActivityStats() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(collection(db, 'sessions'))
        const byTrainer = {}
        snap.docs.forEach((doc) => {
          const s = doc.data()
          const tid = s.trainerId
          if (!byTrainer[tid]) {
            byTrainer[tid] = { plans: 0, feedbacks: 0, adjustments: 0 }
          }
          if (s.planSent) byTrainer[tid].plans++
          if (s.feedbackGiven) byTrainer[tid].feedbacks++
          if (s.adjustments) byTrainer[tid].adjustments += s.adjustments
        })
        setStats(
          Object.entries(byTrainer).map(([trainerId, val]) => ({
            trainerId,
            ...val,
          }))
        )
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { stats, loading, error }
}
