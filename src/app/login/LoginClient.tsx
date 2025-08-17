// src/app/login/LoginClient.tsx
"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginClient({ registered = false }: { registered?: boolean }) {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        setErr("Email ou palavra-passe inválidos.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErr("Não foi possível iniciar sessão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      {registered ? (
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
          Registo concluído. A tua conta aguarda aprovação do administrador.
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
        <span style={{ fontWeight: 600 }}>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="o.teu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Palavra-passe</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            style={secondaryBtnStyle}
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </label>

      <button type="submit" disabled={loading} style={primaryBtnStyle}>
        {loading ? "A entrar..." : "Entrar"}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".92rem", marginTop: 2 }}>
        <a href="#" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Esqueceste-te da palavra-passe?
        </a>
        <a href="/register" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Registar
        </a>
      </div>

      <p style={{ color: "var(--muted)", fontSize: ".9rem", marginTop: 8 }}>
        Após o registo, a tua conta ficará pendente até aprovação por um administrador.
      </p>
    </form>
  );
}

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

const secondaryBtnStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--fg)",
  borderRadius: 12,
  padding: ".65rem .8rem",
  cursor: "pointer",
};