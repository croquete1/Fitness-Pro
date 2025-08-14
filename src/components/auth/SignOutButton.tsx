"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutButton({ label = "Terminar sessão" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      await signOut({ callbackUrl: "/login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Terminar sessão"
      title="Terminar sessão"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".5rem",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        padding: ".4rem .7rem",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {/* Icone “sair” simples */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path d="M10 17l1.4-1.4L8.8 13H21v-2H8.8l2.6-2.6L10 7l-5 5 5 5zM4 5h6V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h6v-2H4V5z" />
      </svg>
      <span>{loading ? "A sair..." : label}</span>
    </button>
  );
}
