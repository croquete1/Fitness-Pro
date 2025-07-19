import React, { useState } from 'react'
import { auth, db } from '../firebase.js'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CSpinner,
} from '@coreui/react'

export default function Register() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('client')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await setDoc(doc(db, 'users', user.uid), { role })
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <CCard style={{ width: '24rem' }}>
        <CCardBody>
          <h3 className="mb-4">Registar</h3>
          {error && <div className="text-danger mb-3">{error}</div>}
          <CForm onSubmit={handleSubmit}>
            <CFormInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mb-3"
            />
            <CFormInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mb-3"
            />
            <select
              className="form-select mb-3"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="client">Cliente</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
            <CButton
              type="submit"
              color="primary"
              className="w-100"
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : 'Registar'}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}
