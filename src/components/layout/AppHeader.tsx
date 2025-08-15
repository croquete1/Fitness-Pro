"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

type Toast = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: string | Date;
};

const POLL_MS = 20000;
const LS_KEY = "fp:lastSeenNotifAt";

export default function AppHeader() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Utilizador";

  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<any>(null);
  const lastSoundAtRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      await checkNew();
      timerRef.current = setInterval(checkNew, POLL_MS);
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };

    async function checkNew() {
      try {
        const since = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
        const qs = new URLSearchParams({ limit: "5" });
        if (since) qs.set("since", since);

        const res = await fetch(`/api/notifications?${qs}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) return;

        const j = (await res.json()) as { ok?: boolean; data?: any[] };
        const list = Array.isArray(j?.data) ? j!.data : [];
        if (list.length === 0) return;

        // Ordena do mais antigo p/ reproduzir de forma sequencial
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

        let sounded = false;
        list.forEach((n) => {
          addToast({
            id: n.id,
            title: n.title || "Notificação",
            body: n.body || "",
            href: n.href || "/dashboard",
            createdAt: n.createdAt,
          });
          if (!sounded) {
            playChime();
            sounded = true;
          }
        });

        const newest = list[list.length - 1];
        if (typeof window !== "undefined") {
          window.localStorage.setItem(LS_KEY, new Date(newest.createdAt).toISOString());
        }
      } catch {
        // silencioso
      }
    }
  }, []);

  function addToast(t: Toast) {
    setToasts((curr) => [...curr, t]);
    // remover toast após 6s
    setTimeout(() => {
      setToasts((curr) => curr.filter((x) => x.id !== t.id));
    }, 6000);
  }

  /** Som discreto (Web Audio) com rate limit e só quando a aba está visível */
  function playChime() {
    if (typeof document === "undefined" || document.visibilityState !== "visible") return;
    const now = Date.now();
    if (now - lastSoundAtRef.current < 1500) return; // rate limit
    lastSoundAtRef.current = now;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880; // tom discreto
      gain.gain.value = 0.03; // volume baixo

      osc.connect(gain);
      gain.connect(ctx.destination);

      const t0 = ctx.currentTime;
      osc.start(t0);
      // envelope curto
      gain.gain.setValueAtTime(0.0, t0);
      gain.gain.linearRampToValueAtTime(0.03, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.002, t0 + 0.25);
      osc.stop(t0 + 0.28);

      osc.onended = () => ctx.close?.();
    } catch {
      // se falhar (autoplay policies), ignora
    }
  }

  return (
    <>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        }}
      >
        <div
          style={{
            height: 60,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 12,
            padding: "0 12px",
          }}
        >
          {/* Esquerda: Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/dashboard" aria-label="Ir para início">
              <Logo size={32} />
            </Link>
          </div>

          {/* Centro: Saudação */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "start" }}>
            <span style={{ fontWeight: 700 }}>Olá, {firstName}</span>
            <span style={{ color: "var(--muted)" }}>· sessão iniciada</span>
          </div>

          {/* Direita: Ações */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="fp-pill"
              title="Terminar sessão"
              style={{ height: 34 }}
            >
              <span className="label">Terminar sessão</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOASTER (top-right) */}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 50,
          display: "grid",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <a
            key={t.id}
            href={t.href}
            style={{
              pointerEvents: "auto",
              minWidth: 280,
              maxWidth: 360,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--bg)",
              boxShadow: "0 10px 20px rgba(0,0,0,.18)",
              padding: "10px 12px",
              transform: "translateY(0)",
              opacity: 1,
              animation: "fp-toast-in 220ms ease-out",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
            {t.body && <div style={{ color: "var(--muted)", fontSize: ".95rem" }}>{t.body}</div>}
          </a>
        ))}
      </div>

      {/* Animação inline */}
      <style jsx global>{`
        @keyframes fp-toast-in {
          0% { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
