import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase_config'
import { useAuthRole } from '../contexts/authRoleContext'
import { LayoutDashboard, Users, LogOut, ShieldCheck, BarChart, Bell, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

const playSound = () => {
  const audio = new Audio('/notification.mp3')
  audio.play()
}

export default function AdminNotifications() {
  const { user, logout } = useAuthRole()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const readTimers = useRef({})
  const seenIds = useRef(new Set())

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const newNotifications = data.filter(n => !seenIds.current.has(n.id))
      newNotifications.forEach(n => seenIds.current.add(n.id))
      if (newNotifications.length > 0) {
        playSound()
        toast.success('📢 Nova notificação recebida!')
      }
      setNotifications(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    notifications.forEach(n => {
      if (!n.read && !readTimers.current[n.id]) {
        readTimers.current[n.id] = setTimeout(() => {
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        }, 5000)
      }
    })
  }, [notifications])

  const navItem = (path, icon, label, badge = 0) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full justify-between hover:bg-blue-100 ${pathname === path ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
    >
      <span className="flex items-center gap-2">{icon} {label}</span>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    const matchesType = filter ? n.type === filter : true
    const matchesSearch = search ? (n.title?.toLowerCase().includes(search.toLowerCase()) || n.message?.toLowerCase().includes(search.toLowerCase())) : true
    return matchesType && matchesSearch
  })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col border-r">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">FitnessPro</h1>
          <p className="text-sm text-gray-500 mt-1">Admin: {user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItem('/admin', <LayoutDashboard className="w-5 h-5" />, 'Dashboard')}
          {navItem('/admin/trainers', <Users className="w-5 h-5" />, 'Personal Trainers')}
          {navItem('/admin/clients', <Users className="w-5 h-5" />, 'Clientes')}
          {navItem('/admin/logs', <ShieldCheck className="w-5 h-5" />, 'Logs')}
          {navItem('/admin/stats', <BarChart className="w-5 h-5" />, 'Estatísticas')}
          {navItem('/admin/notifications', <Bell className="w-5 h-5" />, 'Notificações', unreadCount)}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">Notificações</h2>
            <p className="text-gray-500 text-sm">Histórico de notificações recentes do sistema</p>
          </div>
          <button
            onClick={() => navigate('/admin/notifications/create')}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Nova Notificação
          </button>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Pesquisar notificações..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-64"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="info">Informação</option>
            <option value="alerta">Alerta</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden divide-y">
          {filtered.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">Nenhuma notificação encontrada.</p>
          ) : filtered.map(n => (
            <div key={n.id} className="px-6 py-4 text-sm text-gray-800">
              <div className="font-medium text-blue-600">{n.title}</div>
              <p>{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt?.toDate()).toLocaleString()} — tipo: {n.type}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
