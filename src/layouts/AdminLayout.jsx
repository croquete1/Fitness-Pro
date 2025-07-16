// src/layouts/AdminLayout.jsx
import React from "react";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
