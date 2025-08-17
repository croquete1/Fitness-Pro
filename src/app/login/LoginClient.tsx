"use client";

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
    <div className="auth-wrap">
      <form onSubmit={onSubmit} className="auth-card" aria-labelledby="auth-title">
        <div className="auth-header">
          <Logo size={42} />
          <div>
            <div id="auth-title" className="auth-title">Fitness Pro</div>
            <div className="text-muted">Iniciar sessão</div>
          </div>
        </div>

        <div className="auth-fields">
          <label className="auth-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="auth-input"
          />

          <label className="auth-label" htmlFor="login-password">Palavra-passe</label>
          <div className="auth-password">
            <input
              id="login-password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              required
              className="auth-input"
            />
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
              aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
            >
              {show ? "Esconder" : "Mostrar"}
            </button>
          </div>

          <button
            type="submit"
            className="btn primary"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {err && <div className="badge-danger" role="alert">{err}</div>}

          <div className="auth-actions">
            <Link href="/login/forgot" className="btn link">Esqueceste-te da palavra-passe?</Link>
            <Link href="/register" className="btn link">Registar</Link>
          </div>

          <p className="text-muted small">
            Após o registo, a tua conta fica pendente até aprovação por um administrador.
          </p>
        </div>
      </form>
    </div>
  );
}
