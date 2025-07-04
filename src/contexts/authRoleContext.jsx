import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase/firebase'
import {
  onAuthStateChanged,
  signOut,
  getIdToken
} from 'firebase/auth'
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'

const AuthRoleContext = createContext()

export const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const userData = snap.data()
            const token = await getIdToken(firebaseUser)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              token,
              ...userData
            })
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const getToken = async () => {
    const currentUser = auth.currentUser
    if (currentUser) return await getIdToken(currentUser)
    return null
  }

  const promoteUser = async (uid, newRole) => {
    try {
      const ref = doc(db, 'users', uid)
      await updateDoc(ref, { role: newRole })
    } catch (error) {
      console.error('Erro ao promover utilizador:', error)
    }
  }

  return (
    <AuthRoleContext.Provider value={{ user, loading, logout, getToken, promoteUser }}>
      {children}
    </AuthRoleContext.Provider>
  )
}

// ✅ Agora sim, fora do componente
export const useAuthRole = () => useContext(AuthRoleContext)
