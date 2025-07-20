import React from 'react'
import AppLayout from '../../layouts/AppLayout.jsx'
import {
  CContainer,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { useExportReports } from '../../hooks/useExportReports.jsx'

export default function ExportReports() {
  const { exportCSV, exportPDF } = useExportReports()

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">  
        <h2>Exportar Relatórios</h2>
        <CRow className="g-3 mt-3">
          <CCol>
            <CButton color="primary" onClick={exportCSV}>
              Exportar CSV
            </CButton>
          </CCol>
          <CCol>
            <CButton color="secondary" onClick={exportPDF}>
              Exportar PDF
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
