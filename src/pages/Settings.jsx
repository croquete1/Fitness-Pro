// src/pages/Settings.jsx

export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Definições</h1>
      <p className="text-gray-600 mt-2">Página de configurações do utilizador.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Informações da Conta</h2>
          <p>🔒 Alterar palavra-passe, email ou nome.</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Preferências</h2>
          <p>⚙️ Personalizar notificações ou idioma.</p>
        </div>
      </div>
    </div>
  )
}
