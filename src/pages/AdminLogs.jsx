import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
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
import { db } from '../firebase.js'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'))
      const snap = await getDocs(q)
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <AppLayout>
      <h2 className="mb-4">Logs de Auditoria</h2>
      <CCard>
        <CCardBody>
          {loading ? (
            <CSpinner className="text-center" />
          ) : (
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Usuário</CTableHeaderCell>
                    <CTableHeaderCell>Ação</CTableHeaderCell>
                    <CTableHeaderCell>Quando</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {logs.map((l) => (
                    <CTableRow key={l.id}>
                      <CTableDataCell>{l.userEmail}</CTableDataCell>
                      <CTableDataCell>{l.action}</CTableDataCell>
                      <CTableDataCell>
                        {l.timestamp?.toDate().toLocaleString()}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {logs.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center">
                        Sem logs disponíveis
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>
    </AppLayout>
  )
}
