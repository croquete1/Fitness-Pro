
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 320 },
  { name: 'Mar', value: 280 },
  { name: 'Apr', value: 350 },
  { name: 'May', value: 420 },
  { name: 'Jun', value: 390 },
  { name: 'Jul', value: 480 },
]

function DashboardAdmin() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Painel do Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-6">
          <p className="text-sm text-gray-500">Utilizadores</p>
          <p className="text-2xl font-bold">1,254</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-sm text-gray-500">Receita Mensal</p>
          <p className="text-2xl font-bold">€ 4.520</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-sm text-gray-500">Sessões</p>
          <p className="text-2xl font-bold">542</p>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Estatísticas Mensais</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DashboardAdmin
