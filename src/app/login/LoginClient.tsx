"use client";

import React, { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/layout/Logo";

export default function LoginClient() {
  const sp = useSearchParams();
  const registered = useMemo(() => sp?.get("registered") === "1", [sp]);

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

    try {
      const res = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email,
        password: pw,
      });

      // next-auth trata do redirect; se falhar, mantém-se na página
      if ((res as any)?.error) {
        setErr("Credenciais inválidas. Verifica o email e a palavra-passe.");
        setLoading(false);
      }
    } catch (ex: any) {
      // Mensagem “à prova de bala” (sem vazar detalhes)
      setErr("Não foi possível iniciar sessão. Tenta novamente em alguns segundos.");
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-wrap"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        padding: 16,
        background: "var(--app-bg)",
      }}
    >
      <form onSubmit={onSubmit} className="auth-card" aria-labelledby="auth-title">
        <div className="auth-header">
          <Logo size={32} />
          <div>
            <div id="auth-title" className="auth-title">Fitness Pro</div>
            <div className="text-muted">Iniciar sessão</div>
          </div>
        </div>

        {/* Banner de feedback pós-registo (não quebra se a query não existir) */}
        {registered && (
          <div className="auth-banner success" role="status" aria-live="polite">
            <span className="auth-banner__dot" aria-hidden="true" />
            Conta criada com sucesso. Podes iniciar sessão.
          </div>
        )}

        <div className="auth-fields">
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            autoComplete="username"
          />

          <label className="auth-label" htmlFor="pw">Palavra-passe</label>
          <div className="auth-password">
            <input
              id="pw"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              className="auth-input"
              autoComplete="current-password"
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
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {err && (
            <div className="badge-danger" role="alert" aria-live="assertive">
              {err}
            </div>
          )}

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
