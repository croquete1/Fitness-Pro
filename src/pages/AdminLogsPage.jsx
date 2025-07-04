import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuthRole } from '../contexts/authRoleContext'
import { ArrowDown, ShieldCheck } from 'lucide-react'

export default function AdminLogsPage() {
  const { user } = useAuthRole()
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'logs'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    }

    if (user?.role === 'admin') fetchLogs()
  }, [user])

  if (!user || user.role !== 'admin') return <p className="text-center text-red-600 font-medium">Acesso restrito ao administrador.</p>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-blue-600 w-6 h-6" /> Logs de Ações
        </h1>
        <button className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <ArrowDown className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto shadow border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Ação</th>
              <th className="p-3 border-b">Por</th>
              <th className="p-3 border-b">Sobre</th>
              <th className="p-3 border-b">Função</th>
              <th className="p-3 border-b">Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="even:bg-gray-50 hover:bg-gray-100">
                <td className="p-3 border-b capitalize">{log.action}</td>
                <td className="p-3 border-b font-mono text-xs">{log.by}</td>
                <td className="p-3 border-b font-mono text-xs">{log.target}</td>
                <td className="p-3 border-b">{log.role || '—'}</td>
                <td className="p-3 border-b text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
