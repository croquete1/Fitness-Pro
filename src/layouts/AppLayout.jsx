// src/layouts/AppLayout.jsx
import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

export default function AppLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Topbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
