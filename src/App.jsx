import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardCliente from './pages/DashboardCliente'
import DashboardTrainer from './pages/DashboardTrainer'
import DashboardAdmin from './pages/DashboardAdmin'

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen bg-neutral-50">
        <Header />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/dashboard-cliente" element={<DashboardCliente />} />
            <Route path="/dashboard-trainer" element={<DashboardTrainer />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="*" element={<div>Bem-vindo à aplicação Fitness Pro</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
