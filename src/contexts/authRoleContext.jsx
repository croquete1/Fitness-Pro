export const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔁 AuthState: Iniciando listener...')

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 FirebaseUser:', firebaseUser)

      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)

          console.log('📄 Firestore snapshot exists:', snap.exists())

          if (snap.exists()) {
            const userData = snap.data()
            console.log('✅ Firestore userData:', userData)

            const token = await getIdToken(firebaseUser)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              token,
              ...userData
            })
          } else {
            console.warn('⚠️ Documento do usuário não existe no Firestore.')
            setUser(null)
          }
        } catch (err) {
          console.error('💥 Erro ao obter dados do Firestore:', err)
          setUser(null)
        }
      } else {
        console.log('👤 Usuário não autenticado')
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, []) // ✅ mantém apenas este

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
      console.log(`✅ Utilizador ${uid} promovido para ${newRole}`)
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
