// src/layouts/AppLayout.jsx
import React from 'react'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import Footer  from './Footer'

export default function AppLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Topbar />
        <main className="p-4">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
