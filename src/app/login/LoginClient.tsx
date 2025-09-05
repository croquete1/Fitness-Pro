// src/app/login/LoginClient.tsx
"use client";
import type { Route } from 'next';
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && pw.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password: pw,
    });
    setLoading(false);
    if ((res as any)?.error) setErr("Credenciais inválidas.");
  }

  return (
    <div
      className="auth-wrap"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: 16,
        background: "var(--bg)",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="auth-card"
        aria-labelledby="auth-title"
        style={{
          width: "min(520px, 92vw)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 20px 40px rgba(0,0,0,.06)",
          padding: 20,
        }}
      >
        <div
          className="auth-header"
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}
        >
          <Logo size={32} />
          <div>
            <div id="auth-title" className="auth-title" style={{ fontWeight: 800 }}>
              Fitness Pro
            </div>
            <div className="text-muted">Iniciar sessão</div>
          </div>
        </div>

        <div className="auth-fields" style={{ display: "grid", gap: 12, marginTop: 8 }}>
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 12px",
              background: "var(--bg)",
            }}
          />

          <label className="auth-label">Palavra-passe</label>
          <div className="auth-password" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              className="auth-input"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                background: "var(--bg)",
              }}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
              aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                background: "var(--card)",
              }}
            >
              {show ? "Esconder" : "Mostrar"}
            </button>
          </div>

          {/* Submeter */}
          <button
            type="submit"
            className="btn primary"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            style={{
              borderRadius: 10,
              padding: "12px 14px",
              background: "var(--primary)",
              color: "white",
              opacity: canSubmit ? 1 : 0.7,
            }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {err && (
            <div className="badge-danger" role="alert" style={{ borderRadius: 10, padding: "8px 10px" }}>
              {err}
            </div>
          )}

          <div
            className="auth-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 4,
            }}
          >
            <Link href={'/login/forgot' as Route} className="btn link">
              Esqueceste-te da palavra-passe?
            </Link>
            <Link href={'/register' as Route} className="btn link">
              Registar
            </Link>
          </div>

          <p className="text-muted small" style={{ marginTop: 6 }}>
            Após o registo, a tua conta ficará pendente até aprovação por um administrador.
          </p>
        </div>
      </form>
    </div>
  );
}
