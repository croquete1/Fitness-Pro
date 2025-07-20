// src/pages/Home.jsx
import React from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CWidgetStatsA,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilPeople, cilChart, cilBell } from '@coreui/icons'
import { useAdminStats } from '../hooks/useAdminStats.js'
import { useAdminNotifications } from '../hooks/useAdminNotifications.jsx'

export default function Home() {
  const { stats, monthly, loading: statsLoading } = useAdminStats()
  const { requests, loading: notifLoading }      = useAdminNotifications()

  if (statsLoading || notifLoading) {
    return (
      <div className="text-center mt-5">
        <CSpinner />
      </div>
    )
  }

  // Extrai só o que existe de facto no stats
  const { usersCount, revenue, trainersCount } = stats

  // Calcula sessões totais a partir dos dados mensais
  const totalSessions = Array.isArray(monthly.data)
    ? monthly.data.reduce((sum, v) => sum + v, 0)
    : 0

  const pendingCount = requests.length

  return (
    <CContainer className="mt-4">
      <h2 className="mb-4">Home</h2>

      {/* Cards de Resumo */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="primary"
            title="Clientes"
            value={(usersCount - trainersCount).toLocaleString()}
            icon={<CIcon icon={cilPeople} size="lg" />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="success"
            title="Trainers"
            value={trainersCount.toLocaleString()}
            icon={<CIcon icon={cilUser} size="lg" />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="warning"
            title="Sessões Totais"
            value={totalSessions.toLocaleString()}
            icon={<CIcon icon={cilChart} size="lg" />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="danger"
            title="Registos Pendentes"
            value={pendingCount.toLocaleString()}
            icon={<CIcon icon={cilBell} size="lg" />}
          />
        </CCol>
      </CRow>

      {/* Tabela de Pedidos Pendentes */}
      <CCard>
        <CCardBody>
          <h5 className="mb-3">Detalhes de Registos Pendentes</h5>
          <div className="table-responsive">
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Data</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {requests.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>{r.email}</CTableDataCell>
                    <CTableDataCell>{r.role}</CTableDataCell>
                    <CTableDataCell>
                      {r.timestamp.toDate().toLocaleString()}
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {!pendingCount && (
                  <CTableRow>
                    <CTableDataCell colSpan={3} className="text-center">
                      Nenhum pedido pendente
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}
