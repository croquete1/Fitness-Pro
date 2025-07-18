// src/components/Layout.jsx
import React from 'react'
import { CSidebar, CSidebarNav, CNavItem, CContainer, CHeader, CHeaderNav } from '@coreui/react'
import { Link } from 'react-router-dom'

export default function Layout({ menu, children }) {
  return (
    <>
      <CSidebar unfoldable>
        <CSidebarNav>
          {menu.map(item => (
            <CNavItem key={item.path} component={Link} to={item.path}>
              {item.label}
            </CNavItem>
          ))}
        </CSidebarNav>
      </CSidebar>
      <div className="c-wrapper">
        <CHeader>
          <CHeaderNav>
            {/* podes adicionar logo ou user dropdown aqui */}
          </CHeaderNav>
        </CHeader>
        <CContainer lg className="mt-4">{children}</CContainer>
      </div>
    </>
  )
}
