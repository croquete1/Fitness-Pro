// src/app/login/page.tsx
"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl });
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24 }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Iniciar sessão</h1>

        <label style={{ display: "block", marginTop: 8 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
          placeholder="admin@example.com"
          required
        />

        <label style={{ display: "block", marginTop: 8 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
          placeholder="••••••••"
          required
        />

        <button type="submit" style={btnPrimary}>
          Entrar
        </button>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 12 }}>
          Usa as credenciais definidas no <code>.env</code> para testes.
        </p>
      </form>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  marginTop: 4,
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};
