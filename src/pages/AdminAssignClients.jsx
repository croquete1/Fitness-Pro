import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import { db } from '../firebase.js'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function AdminAssignClients() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [trainers, setTrainers] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      // busca clientes e trainers
      const [cSnap, tSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'client'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'trainer'))),
      ])
      setClients(cSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTrainers(tSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  const handleAssign = async (clientId, trainerId) => {
    await updateDoc(doc(db, 'users', clientId), { trainerId })
    // opcional: recarregar
    setClients(c => c.map(u => u.id === clientId ? { ...u, trainerId } : u))
  }

  return (
    <AppLayout>
      <h2 className="mb-4">Atribuir Clientes a Treinadores</h2>
      {loading ? (
        <div className="text-center">
          <CSpinner />
        </div>
      ) : (
        <CCard>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Cliente</CTableHeaderCell>
                    <CTableHeaderCell>Treinador Atual</CTableHeaderCell>
                    <CTableHeaderCell>Nova Atribuição</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {clients.map((c) => (
                    <CTableRow key={c.id}>
                      <CTableDataCell>{c.email}</CTableDataCell>
                      <CTableDataCell>
                        {
                          trainers.find(t => t.id === c.trainerId)?.email
                          || 'Nenhum'
                        }
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={c.trainerId || ''}
                          onChange={e => handleAssign(c.id, e.target.value)}
                        >
                          <option value="">Sem Treinador</option>
                          {trainers.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.email}
                            </option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}
    </AppLayout>
  )
}
