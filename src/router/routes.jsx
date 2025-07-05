// src/router/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import RedirectByRole from '../pages/RedirectByRole'
import Login from '../pages/Login'

import AdminDashboard from '../pages/AdminDashboard'
import ClientDashboard from '../pages/ClientDashboard'
import TrainerDashboard from '../pages/TrainerDashboard'
import NotFound from '../pages/NotFound'

import AdminOnly from '../pages/ProtectedRoutes/AdminOnly'
import ClienteOnly from '../pages/ProtectedRoutes/ClienteOnly'
import TrainerOnly from '../pages/ProtectedRoutes/TrainerOnly'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
      <Route path="/cliente" element={<ClienteOnly><ClientDashboard /></ClienteOnly>} />
      <Route path="/personal-trainer" element={<TrainerOnly><TrainerDashboard /></TrainerOnly>} />
      <Route path="/redirect" element={<RedirectByRole />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
