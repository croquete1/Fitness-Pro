// src/pages/AdminActivity.jsx
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
import { useAdminActivity } from '../hooks/useAdminActivity.jsx'

export default function AdminActivity() {
  const { activity, loading, error } = useAdminActivity()

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
          <CCardHeader>Atividade Recente</CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Usuário</CTableHeaderCell>
                    <CTableHeaderCell>Ação</CTableHeaderCell>
                    <CTableHeaderCell>Data</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {activity.length ? (
                    activity.map((a) => (
                      <CTableRow key={a.id}>
                        <CTableDataCell>
                          {a.userEmail || a.userId}
                        </CTableDataCell>
                        <CTableDataCell>{a.action}</CTableDataCell>
                        <CTableDataCell>
                          {a.timestamp.toDate().toLocaleString()}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center">
                        Nenhuma atividade registrada
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
