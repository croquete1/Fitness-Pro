import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userData })
          } else {
            console.warn('⚠️ Documento do usuário não existe no Firestore.')
            setUser(null)
          }
        } catch (err) {
          console.error('Erro ao obter dados do Firestore:', err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthRoleContext.Provider value={{ user, loading }}>
      {children}
    </AuthRoleContext.Provider>
  )
}

export const useAuthRole = () => useContext(AuthRoleContext)
