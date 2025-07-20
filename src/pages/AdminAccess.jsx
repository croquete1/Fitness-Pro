// src/pages/AdminAccess.jsx
import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CCard,
  CCardBody,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
} from '@coreui/react'
import { auth, db } from '../firebase.js'
import { sendPasswordResetEmail } from 'firebase/auth'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

export default function AdminAccess() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers]     = useState([])
  const roles = ['client', 'trainer', 'admin']

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    loadUsers()
  }, [])

  const changeRole = async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole })
    setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x))
  }

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email)
    alert(`Email de redefinição enviado para ${email}`)
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
      <h2 className="mb-4">Gestão de Acessos</h2>
      <CCard>
        <CCardBody>
          <div className="table-responsive">
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map(u => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>{u.email}</CTableDataCell>
                    <CTableDataCell style={{ minWidth: '150px' }}>
                      <CFormSelect
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() => resetPassword(u.email)}
                      >
                        Reset Password
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </AppLayout>
  )
}
