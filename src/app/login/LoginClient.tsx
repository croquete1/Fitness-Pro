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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password: pw,
    });
    // next-auth gere o redirect; se falhar mantém-se na página
    setLoading(false);
    if ((res as any)?.error) setErr("Credenciais inválidas.");
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 16, background: "var(--app-bg)" }}>
      <form
        onSubmit={onSubmit}
        className="card"
        style={{ width: "min(720px, 94vw)", padding: 22, borderRadius: 16, boxShadow: "var(--shadow-md)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>Fitness Pro</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Iniciar sessão</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 700 }}>Email</label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
          />

          <label style={{ fontWeight: 700 }}>Palavra-passe</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--fg)",
                outline: "none",
              }}
            />
            <button
              type="button"
              className="pill"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
              aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
            >
              {show ? "Esconder" : "Mostrar"}
            </button>
          </div>

          {/* Botão ENTRAR – sempre visível */}
          <button
            type="submit"
            className="pill"
            disabled={loading}
            style={{
              justifySelf: "start",
              background: "var(--brand)",
              color: "white",
              borderColor: "transparent",
              padding: ".6rem 1rem",
            }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {err && <div className="badge-danger" style={{ padding: 8, borderRadius: 10 }}>{err}</div>}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/login/forgot" className="pill" style={{ padding: "6px 10px" }}>
              Esqueceste-te da palavra-passe?
            </Link>
            <Link href="/register" className="pill" style={{ padding: "6px 10px" }}>
              Registar
            </Link>
          </div>

          <p className="text-muted" style={{ marginTop: 6 }}>
            Após o registo, a tua conta ficará pendente até aprovação por um administrador.
          </p>
        </div>
      </form>
    </div>
  );
}
