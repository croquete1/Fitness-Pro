import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuthRole } from '../contexts/authRoleContext'

export default function AdminPage() {
  const { user } = useAuthRole()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
      setFiltered(data)
    }

    if (user?.role === 'admin') fetchUsers()
  }, [user])

  useEffect(() => {
    setFiltered(
      users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
      )
    )
  }, [search, users])

  const promote = async (uid, role) => {
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, { role })
    setUsers(users.map(u => u.id === uid ? { ...u, role } : u))

    await addDoc(collection(db, 'logs'), {
      action: 'promote',
      by: user.uid,
      target: uid,
      role,
      timestamp: new Date().toISOString()
    })
  }

  const approve = async (uid) => {
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, { status: 'aprovado' })
    setUsers(users.map(u => u.id === uid ? { ...u, status: 'aprovado' } : u))

    await addDoc(collection(db, 'logs'), {
      action: 'approve',
      by: user.uid,
      target: uid,
      timestamp: new Date().toISOString()
    })
  }

  if (!user || user.role !== 'admin') return <p>Acesso restrito ao administrador.</p>

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Painel de Administração</h1>

      <input
        type="text"
        placeholder="Pesquisar utilizadores..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Função</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.name || '-'}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">{u.status || 'pendente'}</td>
              <td className="p-2 border space-x-2">
                {u.status !== 'aprovado' && (
                  <button
                    onClick={() => approve(u.id)}
                    className="text-green-600 hover:underline"
                  >Aprovar</button>
                )}
                <button onClick={() => promote(u.id, 'admin')} className="text-blue-600 hover:underline">Admin</button>
                <button onClick={() => promote(u.id, 'trainer')} className="text-yellow-600 hover:underline">Trainer</button>
                <button onClick={() => promote(u.id, 'client')} className="text-gray-600 hover:underline">Cliente</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
