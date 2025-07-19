// src/pages/UsersManagement.jsx
import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import { db } from '../firebase.js'
import { collection, getDocs } from 'firebase/firestore'

export default function UsersManagement() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers]     = useState([])

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(
        snap.docs.map(doc => ({ id: doc.id, email: doc.data().email, role: doc.data().role }))
      )
      setLoading(false)
    }
    load()
  }, [])

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
      <h2 className="mb-4">Gestão de Utilizadores</h2>
      <div className="table-responsive">
        <CTable hover>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map(u => (
              <CTableRow key={u.id}>
                <CTableDataCell>{u.id}</CTableDataCell>
                <CTableDataCell>{u.email || '-'}</CTableDataCell>
                <CTableDataCell>{u.role}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </AppLayout>
  )
}
