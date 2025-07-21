// src/pages/DashboardAdmin.jsx
import React from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CContainer,
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUser, cilChart, cilBell } from '@coreui/icons'
import { useAdminStats } from '../hooks/useAdminStats.jsx'

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-danger text-center mt-5">
          Erro: {error.message}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Visão Geral</h2>
        <CRow className="g-3 mb-4">
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="primary"
              title="Clientes"
              value={(stats.usersCount - stats.trainersCount).toLocaleString()}
              icon={<CIcon icon={cilPeople} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="success"
              title="Trainers"
              value={stats.trainersCount.toLocaleString()}
              icon={<CIcon icon={cilUser} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="warning"
              title="Sessões"
              value={stats.sessionsCount.toLocaleString()}
              icon={<CIcon icon={cilChart} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="danger"
              title="Pendentes"
              value={stats.pendingCount.toLocaleString()}
              icon={<CIcon icon={cilBell} size="lg" />}
            />
          </CCol>
        </CRow>

        {/* ... aqui podes manter os gráficos de monthly */}
      </CContainer>
    </AppLayout>
  )
}
