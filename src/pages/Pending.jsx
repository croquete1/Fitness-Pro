// src/pages/Pending.jsx
import React from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
} from '@coreui/react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Pending() {
  const { status } = useAuth()

  return (
    <AppLayout>
      <CContainer className="text-center mt-5">
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody>
                {status === 'pending' ? (
                  <>
                    <h3>Registo Pendente</h3>
                    <p>
                      Obrigado pelo seu registo. A sua conta está pendente de aprovação.
                    </p>
                    <p>Receberá uma notificação assim que a conta for ativada.</p>
                  </>
                ) : (
                  <>
                    <h3>Registo Rejeitado</h3>
                    <p>
                      O seu pedido de registo foi rejeitado. Contacte o suporte para mais informações.
                    </p>
                  </>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
