// src/pages/DashboardTrainer.jsx
import React from 'react'
import Layout from '../components/Layout'
import WidgetsBrand     from '../coreui/views/WidgetsBrand.jsx'
import WidgetsDropdown from '../coreui/views/WidgetsDropdown.jsx'

const menuTrainer = [
  { path: '/trainer', label: 'Home Trainer' },
  { path: '/trainer/feed', label: 'Feedback' },
]

export default function DashboardTrainer() {
  return (
    <Layout menu={menuTrainer}>
      <h2>Trainer Dashboard</h2>
      <WidgetsBrand />
      {/* adiciona gráficos e tabelas para trainers */}
    </Layout>
  )
}
