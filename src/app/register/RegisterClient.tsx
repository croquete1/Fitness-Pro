// src/app/register/RegisterClient.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/* --- Estilos reutilizáveis --- */
const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--fg)",
  borderRadius: 12,
  padding: ".65rem .8rem",
  outline: "none",
};

const primaryBtnStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--accent)",
  color: "#fff",
  borderRadius: 12,
  padding: ".65rem .9rem",
  fontWeight: 700,
  cursor: "pointer",
};

export default function RegisterClient() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Falha no registo");
      }

      setOk(true);
      // redireciona para login com flag
      setTimeout(() => router.replace("/login?registered=1"), 600);
    } catch (e: any) {
      setErr(e?.message ?? "Não foi possível concluir o registo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      {ok ? (
        <div
          role="status"
          style={{
            border: "1px solid var(--border)",
            background: "var(--chip)",
            color: "var(--fg)",
            padding: ".6rem .75rem",
            borderRadius: 12,
            fontSize: ".9rem",
          }}
        >
          Conta criada. A aguardar aprovação do administrador…
        </div>
      ) : null}

      {err ? (
        <div
          role="alert"
          style={{
            border: "1px solid #ef4444",
            background: "rgba(239,68,68,.08)",
            color: "#ef4444",
            padding: ".6rem .75rem",
            borderRadius: 12,
            fontSize: ".9rem",
          }}
        >
          {err}
        </div>
      ) : null}

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Nome</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Palavra-passe</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>

      <button type="submit" disabled={loading} style={primaryBtnStyle}>
        {loading ? "A registar..." : "Registar"}
      </button>

      <div style={{ textAlign: "right", fontSize: ".92rem" }}>
        Já tem conta?{" "}
        <a href="/login" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Iniciar sessão
        </a>
      </div>
    </form>
  );
}