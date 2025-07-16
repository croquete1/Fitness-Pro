// src/layouts/ClienteLayout.jsx
import React from "react";
import SidebarCliente from "../components/SidebarCliente";

export default function ClienteLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <SidebarCliente />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
