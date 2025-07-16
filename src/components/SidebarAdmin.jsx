// src/components/SidebarAdmin.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarAdmin() {
  return (
    <aside className="w-64 h-full bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Admin</h2>
      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard/admin" className="hover:bg-gray-700 p-2 rounded">
          Visão Geral
        </NavLink>
        <NavLink to="/dashboard/admin/users" className="hover:bg-gray-700 p-2 rounded">
          Utilizadores
        </NavLink>
        <NavLink to="/dashboard/admin/settings" className="hover:bg-gray-700 p-2 rounded">
          Configurações
        </NavLink>
      </nav>
    </aside>
  );
}
