import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase_config'
import { useAuthRole } from '../contexts/authRoleContext'
import { LogOut, CheckCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminClientsPage() {
  const { user, logout } = useAuthRole()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role === 'cliente')
      setClients(filtered)
      setLoading(false)
    }
    fetchClients()
  }, [])

  const approveClient = async (id) => {
    await updateDoc(doc(db, 'users', id), { status: 'aprovado' })
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'aprovado' } : c))
  }

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Clientes</h2>
          <p className="text-gray-500 text-sm">Lista completa de clientes registados</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">
          <Loader2 className="w-6 h-6 mx-auto animate-spin" /> A carregar clientes...
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-t">
                  <td className="p-4">{client.name || '—'}</td>
                  <td className="p-4">{client.email}</td>
                  <td className="p-4">{client.status || 'pendente'}</td>
                  <td className="p-4 text-center">
                    {client.status !== 'aprovado' && (
                      <button
                        onClick={() => approveClient(client.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs inline-flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
