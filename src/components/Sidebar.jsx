import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear">
      <div className="flex items-center justify-between gap-2 px-6 py-5">
        <Link to="/" className="text-white text-lg font-semibold">FitnessPro</Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="flex flex-col gap-2">
          <li>
            <Link to="/" className="text-white hover:text-gray-300 transition">Dashboard</Link>
          </li>
          <li>
            <Link to="/users" className="text-white hover:text-gray-300 transition">Utilizadores</Link>
          </li>
          <li>
            <Link to="/settings" className="text-white hover:text-gray-300 transition">Definições</Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
