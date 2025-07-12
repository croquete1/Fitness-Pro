import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen shadow-md">
      <div className="p-4 font-bold text-lg border-b">Fitness Pro</div>
      <nav className="flex flex-col p-4 space-y-2">
        <Link to="/" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/users" className="hover:text-blue-600">Utilizadores</Link>
        <Link to="/settings" className="hover:text-blue-600">Definições</Link>
      </nav>
    </aside>
  )
}

export default Sidebar
