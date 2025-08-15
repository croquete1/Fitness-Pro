// src/app/login/LoginClient.tsx
"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // NextAuth envia ?callbackUrl=... quando és redirecionado de páginas protegidas
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  // Mensagens simples para erros comuns do NextAuth (?error=CredentialsSignin, etc.)
  const authError = toHumanError(params.get("error"));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Usa redirect true (default) para deixar o NextAuth redirecionar para callbackUrl
      await signIn("credentials", {
        email,
        password,
        callbackUrl,
      });
    } finally {
      // Nota: com redirect, este estado pode não ser visto se a navegação for imediata
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={card} aria-labelledby="login-title">
        <h1 id="login-title" style={h1}>Iniciar sessão</h1>

        {authError && (
          <div role="alert" style={alert}>
            {authError}
          </div>
        )}

        <label htmlFor="email" style={label}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={input}
          placeholder="admin@example.com"
        />

        <label htmlFor="password" style={label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={input}
          placeholder="••••••••"
        />

        <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? "A entrar…" : "Entrar"}
        </button>

        <p style={hint}>
          Para testes locais, define as credenciais no <code>.env</code>:
          <br />
          <code>SEED_ADMIN_EMAIL</code> e <code>SEED_ADMIN_PASSWORD</code>
        </p>

        <p style={hintSmall}>
          Serás redirecionado para: <code>{callbackUrl}</code>
        </p>
      </form>
    </div>
  );
}

/* ---------- Helpers ---------- */
function toHumanError(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "CredentialsSignin":
      return "Credenciais inválidas. Verifica o email e a password.";
    case "AccessDenied":
      return "Acesso negado.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
      return "Erro de autenticação OAuth.";
    case "SessionRequired":
      return "Sessão necessária para aceder à página.";
    default:
      return "Ocorreu um erro ao autenticar.";
  }
}

/* ---------- Styles (inline, sem dependências) ---------- */
const wrap: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  minHeight: "100vh",
  padding: 24,
  background: "var(--bg, #fff)",
  color: "var(--fg, #111827)",
};

const card: React.CSSProperties = {
  width: 360,
  border: "1px solid var(--border, #e5e7eb)",
  borderRadius: 12,
  padding: 16,
  background: "var(--panel, #fff)",
  boxShadow: "0 10px 24px rgba(0,0,0,.06)",
};

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 8 };

const label: React.CSSProperties = { display: "block", marginTop: 8, fontSize: 14, fontWeight: 600 };

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border, #e5e7eb)",
  borderRadius: 8,
  marginTop: 4,
  background: "transparent",
  color: "inherit",
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

const hint: React.CSSProperties = { fontSize: 12, color: "#6b7280", marginTop: 12, lineHeight: 1.5 };
const hintSmall: React.CSSProperties = { fontSize: 11, color: "#9ca3af", marginTop: 6 };
const alert: React.CSSProperties = {
  border: "1px solid #fca5a5",
  background: "#fef2f2",
  color: "#991b1b",
  padding: "8px 10px",
  borderRadius: 8,
  marginBottom: 8,
};
