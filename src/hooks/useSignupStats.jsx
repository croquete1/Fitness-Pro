import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import moment from 'moment'

export function useSignupStats() {
  const [data, setData] = useState({ labels: [], counts: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt'))
        )
        const byPeriod = {}
        snap.docs.forEach((doc) => {
          const dt = doc.data().createdAt.toDate()
          const label = moment(dt).format('MMM YYYY')
          byPeriod[label] = (byPeriod[label] || 0) + 1
        })
        setData({
          labels: Object.keys(byPeriod),
          counts: Object.values(byPeriod),
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { data, loading, error }
}
