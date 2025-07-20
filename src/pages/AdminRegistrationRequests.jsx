// src/pages/AdminRegistrationRequests.jsx
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
  CButton,
  CSpinner,
} from '@coreui/react'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export default function AdminRegistrationRequests() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const q = query(
        collection(db, 'notifications'),
        where('type', '==', 'registration'),
        where('read', '==', false),
      )
      const snap = await getDocs(q)
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  const handleDecision = async (req, decision) => {
    setLoading(true)
    // 1. Atualiza status do user
    await updateDoc(doc(db, 'users', req.userId), {
      status: decision,
    })
    // 2. Marca notificação como lida
    await updateDoc(doc(db, 'notifications', req.id), {
      read: true,
    })
    // 3. Atualiza lista local
    setRequests(prev => prev.filter(r => r.id !== req.id))
    setLoading(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <h2 className="mb-4">Pedidos de Registo</h2>
      <CCard>
        <CCardHeader>
          Solicitações pendentes de aprovação
        </CCardHeader>
        <CCardBody>
          <div className="table-responsive">
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Data</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {requests.length > 0 ? (
                  requests.map(req => (
                    <CTableRow key={req.id}>
                      <CTableDataCell>{req.email}</CTableDataCell>
                      <CTableDataCell>{req.role}</CTableDataCell>
                      <CTableDataCell>
                        {req.timestamp.toDate().toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleDecision(req, 'active')}
                        >
                          Aprovar
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDecision(req, 'rejected')}
                        >
                          Rejeitar
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center">
                      Não há pedidos pendentes
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </AppLayout>
  )
}
