// src/pages/DashboardCliente.jsx
import React from 'react'
import Layout from '../components/Layout'
import WidgetsBrand     from '../coreui/views/WidgetsBrand.jsx'
import WidgetsDropdown from '../coreui/views/WidgetsDropdown.jsx'

const menuCliente = [
  { path: '/dashboard', label: 'Home Cliente' },
  { path: '/dashboard/plan', label: 'Plano Semanal' },
]

export default function DashboardCliente() {
  return (
    <Layout menu={menuCliente}>
      <h2>Cliente Dashboard</h2>
      <WidgetsDropdown />
      {/* mostra o plano do cliente aqui */}
    </Layout>
  )
}
