import React from 'react'
import AppLayout from '../../layouts/AppLayout.jsx'
import {
  CContainer,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { useTrainerActivityStats } from '../../hooks/useTrainerActivityStats.jsx'

export default function TrainerActivity() {
  const { stats, loading, error } = useTrainerActivityStats()
  if (loading) {
    return (
      <AppLayout>
        <CSpinner />
      </AppLayout>
    )
  }
  if (error) {
    return (
      <AppLayout>
        <div>Erro: {error.message}</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2>Atividade por Trainer</h2>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Trainer ID</CTableHeaderCell>
              <CTableHeaderCell>Planos</CTableHeaderCell>
              <CTableHeaderCell>Feedbacks</CTableHeaderCell>
              <CTableHeaderCell>Ajustes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {stats.map((row) => (
              <CTableRow key={row.trainerId}>
                <CTableDataCell>{row.trainerId}</CTableDataCell>
                <CTableDataCell>{row.plans}</CTableDataCell>
                <CTableDataCell>{row.feedbacks}</CTableDataCell>
                <CTableDataCell>{row.adjustments}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CContainer>
    </AppLayout>
  )
}
