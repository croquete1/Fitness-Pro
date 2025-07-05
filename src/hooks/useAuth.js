// src/hooks/useAuth.js

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase' // ajusta se o path for diferente

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const role = currentUser?.email?.includes('admin')
          ? 'admin'
          : currentUser?.email?.includes('trainer')
          ? 'trainer'
          : 'cliente'

        setUser({ ...currentUser, role })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
