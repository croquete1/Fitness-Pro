// src/layouts/Footer.jsx
import React from 'react'
import { CFooter } from '@coreui/react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <CFooter className="py-3 text-center">
      <div>&copy; {currentYear} Fitness Pro. Todos os direitos reservados.</div>
    </CFooter>
  )
}
