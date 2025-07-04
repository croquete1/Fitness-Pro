import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuthRole } from '../contexts/authRoleContext'

export default function AdminTrainersPage() {
  const { user } = useAuthRole()
  const [trainers, setTrainers] = useState([])

  useEffect(() => {
    const fetchTrainers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role === 'trainer')
      setTrainers(data)
    }

    if (user?.role === 'admin') fetchTrainers()
  }, [user])

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lista de Personal Trainers</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Estado</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map(t => (
            <tr key={t.id} className="border-t hover:bg-gray-50">
              <td className="p-2 border">{t.name || '—'}</td>
              <td className="p-2 border">{t.email}</td>
              <td className="p-2 border">{t.status || 'pendente'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
