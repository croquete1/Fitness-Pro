// src/pages/DashboardCliente.jsx
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
import { cilList, cilCheckCircle, cilCalendar } from '@coreui/icons'
import { useClientDashboard } from '../hooks/useClientDashboard.jsx'

export default function DashboardCliente() {
  const { stats, loading, error } = useClientDashboard()

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

  const { workoutCount, completedSessions, upcomingSessions } = stats

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Dashboard Cliente</h2>
        <CRow className="g-3 mb-4">
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="primary"
              title="Meus Treinos"
              value={workoutCount.toLocaleString()}
              icon={<CIcon icon={cilList} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="success"
              title="Concluídas"
              value={completedSessions.toLocaleString()}
              icon={<CIcon icon={cilCheckCircle} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="warning"
              title="Próximas Sessões"
              value={upcomingSessions.toLocaleString()}
              icon={<CIcon icon={cilCalendar} size="lg" />}
            />
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
