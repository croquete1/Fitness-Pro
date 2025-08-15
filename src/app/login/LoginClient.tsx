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
        const code = (res?.error || "").toString().toUpperCase();
        if (code.includes("PENDING")) {
          setErr("A tua conta ainda não foi aprovada pelo administrador.");
        } else if (code.includes("SUSPENDED")) {
          setErr("A tua conta está suspensa. Contacta o suporte.");
        } else {
          setErr("Email ou palavra-passe inválidos.");
        }
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
            background: "var(--panel)",
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Palavra-passe</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            style={secondaryBtnStyle}
            aria-label={show ? "Esconder password" : "Mostrar password"}
          >
            {show ? "Esconder" : "Mostrar"}
          </button>
        </div>
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? "A entrar…" : "Entrar"}
        </button>
        <a href="/register" style={{ ...secondaryBtnStyle, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          Criar conta
        </a>
      </div>
    </form>
  );
}

/* estilos inline mínimos */
const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: ".65rem .75rem",
  borderRadius: 10,
  background: "transparent",
  color: "inherit",
};
const primaryBtnStyle: React.CSSProperties = {
  border: "1px solid var(--fg)",
  background: "var(--fg)",
  color: "var(--bg)",
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
