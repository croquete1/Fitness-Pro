// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Página não encontrada</h1>
      <p className="text-gray-600 mb-6">Parece que esta página não existe ou foi removida.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Voltar ao início
      </Link>
    </div>
  )
}
