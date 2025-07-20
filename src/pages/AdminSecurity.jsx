import React from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import { useAdminSecurity } from '../hooks/useAdminSecurity.jsx'

export default function AdminSecurity() {
  const { alerts, loading, error } = useAdminSecurity()

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
        <CCard>
          <CCardHeader>Autenticações Falhadas & Tentativas Suspeitas</CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Usuário</CTableHeaderCell>
                    <CTableHeaderCell>Evento</CTableHeaderCell>
                    <CTableHeaderCell>IP</CTableHeaderCell>
                    <CTableHeaderCell>Timestamp</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {alerts.length ? (
                    alerts.map((a) => (
                      <CTableRow key={a.id}>
                        <CTableDataCell>{a.userEmail || a.userId}</CTableDataCell>
                        <CTableDataCell>{a.eventType}</CTableDataCell>
                        <CTableDataCell>{a.ipAddress || '–'}</CTableDataCell>
                        <CTableDataCell>
                          {a.timestamp.toDate().toLocaleString()}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={4} className="text-center">
                        Nenhum alerta de segurança
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CContainer>
    </AppLayout>
  )
}
