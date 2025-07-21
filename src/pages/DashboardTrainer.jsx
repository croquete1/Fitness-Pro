// src/pages/DashboardTrainer.jsx
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
import { cilPeople, cilCalendar, cilDollar } from '@coreui/icons'
import { useTrainerDashboard } from '../hooks/useTrainerDashboard.jsx'

export default function DashboardTrainer() {
  const { stats, loading, error } = useTrainerDashboard()

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

  const { clientsCount, upcomingSessions, revenue } = stats

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Dashboard Trainer</h2>
        <CRow className="g-3 mb-4">
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="primary"
              title="Clientes"
              value={clientsCount.toLocaleString()}
              icon={<CIcon icon={cilPeople} size="lg" />}
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
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="success"
              title="Receita"
              value={`$${revenue.toLocaleString()}`}
              icon={<CIcon icon={cilDollar} size="lg" />}
            />
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
