"use client";

import React from "react";
import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

export default function Sidebar({ open, onClose, onToggle }: Props) {
  return (
    <aside
      aria-hidden={!open}
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        width: open ? 260 : 64,
        transition: "width .2s",
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        minHeight: "100dvh",
      }}
    >
      <div style={{ padding: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" className="pill" onClick={onToggle} aria-label="Alternar menu">
          ☰
        </button>
        {open && <strong>Menu</strong>}
      </div>

      <nav style={{ display: "grid", gap: 4, padding: 8 }}>
        <Link className="pill" href="/dashboard">Dashboard</Link>
        <Link className="pill" href="/dashboard/admin">Administração</Link>
        <Link className="pill" href="/dashboard/pt-clientes">PT - Clientes</Link>
        <button type="button" className="pill" onClick={onClose}>Fechar</button>
      </nav>
    </aside>
  );
}
