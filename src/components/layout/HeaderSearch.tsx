"use client";

import React from "react";
import { Search } from "lucide-react";

export default function HeaderSearch() {
  return (
    <form
      role="search"
      aria-label="Pesquisar clientes"
      onSubmit={(e) => e.preventDefault()}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1fr",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--card)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <Search size={18} style={{ opacity: 0.75 }} />
        <input
          aria-label="Pesquisar cliente por nome ou email"
          placeholder="Pesquisar cliente por nome ou email…"
          style={{
            width: "100%",
            border: 0,
            outline: "none",
            background: "transparent",
            color: "var(--fg)",
            fontSize: 14,
          }}
        />
      </div>
    </form>
  );
}
