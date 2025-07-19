import React from 'react'
import { CFooter } from '@coreui/react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <CFooter className="py-3 text-center">
      <div>&copy; {year} Fitness Pro. Todos os direitos reservados.</div>
    </CFooter>
  )
}
