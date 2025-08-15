// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

type Toast = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: string | Date;
};

const POLL_MS = 10_000;
const LS_LASTSEEN = "fp:lastSeenNotifAt";
const LS_SOUND    = "fp:toastSound";      // "on" | "off"
const LS_DND      = "fp:toastDnd";        // "on" | "off" (manual)
const LS_UNREAD   = "fp:toastUnread";     // number (badge)
const LS_AUTO     = "fp:autoDnd";         // "on" | "off"
const LS_AUTO_S   = "fp:autoDndStart";    // "22"
const LS_AUTO_E   = "fp:autoDndEnd";      // "8"

// ---------- Utils ----------
function inQuietHours(now: Date, startHour: number, endHour: number) {
  const h = now.getHours();
  if (startHour === endHour) return false;
  if (startHour < endHour) return h >= startHour && h < endHour;
  return h >= startHour || h < endHour; // janela atravessa a meia-noite
}
function clampHour(n: number) { return Math.max(0, Math.min(23, Math.round(n))); }

// ---------- Tooltip simples (acessível) ----------
function Tip({
  label,
  children,
  side = "top",
  delay = 350,
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  function onEnter() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay) as unknown as number;
  }
  function onLeave() {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            [side === "top" ? "bottom" : "top"]: "110%",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: ".9rem",
            border: "1px solid var(--border)",
            background: "var(--panel, var(--bg))",
            padding: "6px 8px",
            color: "inherit",
            borderRadius: 8,
            pointerEvents: "none",
            boxShadow: "0 8px 16px rgba(0,0,0,.18)",
            zIndex: 80,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

// ---------- Component ----------
export default function AppHeader() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Utilizador";

  const [toasts, setToasts]   = useState<Toast[]>([]);
  const [soundOn, setSound]   = useState(true);
  const [dndManual, setDnd]   = useState(false);
  const [unread, setUnread]   = useState(0);

  const [autoOn, setAutoOn]   = useState(true);
  const [autoStart, setAS]    = useState(22); // 22:00
  const [autoEnd, setAE]      = useState(8);  // 08:00
  const [showPicker, setPick] = useState(false);

  // menu hover para Auto DND
  const [showAutoMenu, setShowAutoMenu] = useState(false);
  const hoverTimer = useRef<number | null>(null);

  const timerRef = useRef<any>(null);
  const lastSoundAtRef = useRef<number>(0);
  const tickRef  = useRef<any>(null);

  // Boot prefs
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSound((localStorage.getItem(LS_SOUND) || "on") === "on");
    setDnd((localStorage.getItem(LS_DND) || "off") === "on");
    setUnread(Number(localStorage.getItem(LS_UNREAD) || "0"));
    setAutoOn((localStorage.getItem(LS_AUTO) || "on") === "on");
    setAS(clampHour(Number(localStorage.getItem(LS_AUTO_S) || "22")));
    setAE(clampHour(Number(localStorage.getItem(LS_AUTO_E) || "8")));
  }, []);

  // tique por minuto para refletir janelas de horário
  useEffect(() => {
    tickRef.current = setInterval(() => setPick((v) => v), 60_000);
    return () => tickRef.current && clearInterval(tickRef.current);
  }, []);

  // poll + onFocus
  useEffect(() => {
    const check = async () => {
      try {
        const since = typeof window !== "undefined" ? window.localStorage.getItem(LS_LASTSEEN) : null;
        const qs = new URLSearchParams({ limit: "5" });
        if (since) qs.set("since", since);

        const res = await fetch(`/api/notifications?${qs}`, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;

        const j = (await res.json()) as { ok?: boolean; data?: any[] };
        const list = Array.isArray(j?.data) ? j!.data : [];
        if (list.length === 0) return;

        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

        if (effectiveDnd) {
          // acumula badge persistente
          setUnread((prev) => {
            const next = Math.min(prev + list.length, 99); // cap 99+
            localStorage.setItem(LS_UNREAD, String(next));
            return next;
          });
        } else {
          let played = false;
          list.forEach((n) => {
            addToast({
              id: n.id,
              title: n.title || "Notificação",
              body: n.body || "",
              href: n.href || "/dashboard",
              createdAt: n.createdAt,
            });
            if (!played && soundOn) {
              playChime();
              played = true;
            }
          });
        }

        const newest = list[list.length - 1];
        if (typeof window !== "undefined") {
          window.localStorage.setItem(LS_LASTSEEN, new Date(newest.createdAt).toISOString());
        }
      } catch {}
    };

    void check();
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") void check();
    }, POLL_MS);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [soundOn, dndManual, autoOn, autoStart, autoEnd]);

  const effectiveDnd = useMemo(
    () => dndManual || (autoOn && inQuietHours(new Date(), autoStart, autoEnd)),
    [dndManual, autoOn, autoStart, autoEnd, showPicker]
  );

  function addToast(t: Toast) {
    setToasts((curr) => [...curr, t]);
    setTimeout(() => setToasts((curr) => curr.filter((x) => x.id !== t.id)), 6000);
  }

  function playChime() {
    if (typeof document === "undefined" || document.visibilityState !== "visible") return;
    const now = Date.now();
    if (now - lastSoundAtRef.current < 1500) return;
    lastSoundAtRef.current = now;

    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.03;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const t0 = ctx.currentTime;
      osc.start(t0);
      gain.gain.setValueAtTime(0.0, t0);
      gain.gain.linearRampToValueAtTime(0.03, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.002, t0 + 0.25);
      osc.stop(t0 + 0.28);
      osc.onended = () => ctx.close?.();
    } catch {}
  }

  function toggleSound() {
    const next = !soundOn;
    setSound(next);
    if (typeof window !== "undefined") localStorage.setItem(LS_SOUND, next ? "on" : "off");
  }
  function toggleManualDnd() {
    const next = !dndManual;
    setDnd(next);
    if (typeof window !== "undefined") localStorage.setItem(LS_DND, next ? "on" : "off");
  }
  function toggleAutoDnd() {
    const next = !autoOn;
    setAutoOn(next);
    if (typeof window !== "undefined") localStorage.setItem(LS_AUTO, next ? "on" : "off");
  }

  // abrir picker
  function openPicker() {
    setShowAutoMenu(false);
    setPick(true);
  }
  function saveWindow(s: number, e: number) {
    const ns = clampHour(s);
    const ne = clampHour(e);
    setAS(ns);
    setAE(ne);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_AUTO_S, String(ns));
      localStorage.setItem(LS_AUTO_E, String(ne));
    }
    setPick(false);
  }

  // hover handlers para o menu
  function onAutoEnter() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setShowAutoMenu(true), 180);
  }
  function onAutoLeave() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    setShowAutoMenu(false);
  }

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid var(--border)",
          background: "var(--panel, var(--bg))", // mais estável no dark-mode
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
          {/* Esquerda */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/dashboard" aria-label="Ir para início"><Logo size={32} /></Link>
          </div>

          {/* Centro */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "start" }}>
            <span style={{ fontWeight: 700 }}>Olá, {firstName}</span>
            <span style={{ color: "var(--muted)" }}>· sessão iniciada</span>
          </div>

          {/* Direita */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            {/* DND manual */}
            <Tip label={dndManual ? "DND manual ativo — clicar para desativar" : "Ativar DND manual"}>
              <button
                type="button"
                className="fp-pill"
                onClick={toggleManualDnd}
                style={{
                  height: 34,
                  borderColor: effectiveDnd ? "var(--accent)" : "var(--border)",
                  background: dndManual ? "var(--chip)" : "transparent",
                }}
              >
                <span aria-hidden>🌙</span>
                <span className="label" style={{ marginLeft: 6 }}>DND</span>
                {unread > 0 && (
                  <span
                    aria-live="polite"
                    style={{
                      marginLeft: 6,
                      minWidth: 22,
                      height: 22,
                      border: "1px solid var(--border)",
                      borderRadius: 999,
                      display: "inline-grid",
                      placeItems: "center",
                      padding: "0 6px",
                      fontWeight: 700,
                      background: "var(--chip)",
                    }}
                  >
                    {unread}
                  </span>
                )}
              </button>
            </Tip>

            {/* Auto DND + menu ao passar o rato */}
            <div style={{ position: "relative" }} onMouseEnter={onAutoEnter} onMouseLeave={onAutoLeave}>
              <button
                type="button"
                className="fp-pill"
                onClick={toggleAutoDnd}
                style={{
                  height: 34,
                  borderColor: autoOn ? "var(--accent)" : "var(--border)",
                  background: autoOn ? "var(--chip)" : "transparent",
                }}
                aria-haspopup="true"
                aria-expanded={showAutoMenu || showPicker}
                title={`DND automático ${autoOn ? "ativo" : "inativo"}`}
              >
                <span aria-hidden>⏰</span>
                <span className="label" style={{ marginLeft: 6 }}>
                  Auto {String(autoStart).padStart(2, "0")}–{String(autoEnd).padStart(2, "0")}
                </span>
                {autoOn && !dndManual && inQuietHours(new Date(), autoStart, autoEnd) && (
                  <span
                    aria-hidden
                    style={{
                      width: 8, height: 8, borderRadius: 999, marginLeft: 6,
                      background: "var(--accent)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)"
                    }}
                  />
                )}
              </button>

              {/* Popover hover */}
              {showAutoMenu && (
                <div
                  role="menu"
                  aria-label="Opções de DND automático"
                  style={{
                    position: "absolute",
                    top: "110%", right: 0,
                    zIndex: 60,
                    border: "1px solid var(--border)",
                    background: "var(--panel, var(--bg))",
                    borderRadius: 12,
                    padding: 8,
                    display: "grid",
                    gap: 6,
                    width: 260,
                    boxShadow: "0 10px 24px rgba(0,0,0,.18)",
                    animation: "fp-toast-in 140ms ease-out",
                  }}
                >
                  <div style={{ fontWeight: 700, margin: "2px 6px 6px" }}>DND automático</div>
                  <button
                    role="menuitem"
                    className="fp-pill"
                    style={{ justifyContent: "space-between", height: 34 }}
                    onClick={toggleAutoDnd}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {autoOn ? "🟢" : "⚪"} <span>{autoOn ? "Ativo" : "Inativo"}</span>
                    </span>
                    <span className="label" />
                  </button>
                  <button
                    role="menuitem"
                    className="fp-pill"
                    style={{ justifyContent: "space-between", height: 34 }}
                    onClick={openPicker}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      🕒 <span>Definir horário…</span>
                    </span>
                    <span className="label">{String(autoStart).padStart(2, "0")}–{String(autoEnd).padStart(2, "0")}</span>
                  </button>
                  <small style={{ color: "var(--muted)", padding: "2px 6px 0" }}>
                    Sugestão: {autoStart}–{autoEnd} (atravessa a meia-noite).
                  </small>
                </div>
              )}

              {/* Mini Picker */}
              {showPicker && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%", right: 0,
                    zIndex: 70,
                    border: "1px solid var(--border)",
                    background: "var(--panel, var(--bg))",
                    borderRadius: 12,
                    padding: 10,
                    display: "grid",
                    gap: 8,
                    width: 260,
                    boxShadow: "0 10px 24px rgba(0,0,0,.18)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Janela de silêncio</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <label style={{ display: "grid", gap: 4 }}>
                      <span style={{ fontSize: ".9rem", color: "var(--muted)" }}>Início</span>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={autoStart}
                        onChange={(e) => setAS(clampHour(Number(e.target.value)))}
                        style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent", color: "inherit" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 4 }}>
                      <span style={{ fontSize: ".9rem", color: "var(--muted)" }}>Fim</span>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={autoEnd}
                        onChange={(e) => setAE(clampHour(Number(e.target.value)))}
                        style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "transparent", color: "inherit" }}
                      />
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="fp-pill" style={{ height: 32 }} onClick={() => setPick(false)}>Cancelar</button>
                    <button className="fp-pill" style={{ height: 32 }} onClick={() => saveWindow(autoStart, autoEnd)}>Guardar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Som */}
            <Tip label={soundOn ? "Silenciar notificações sonoras" : "Ativar som das notificações"}>
              <button
                type="button"
                className="fp-pill"
                onClick={toggleSound}
                style={{ height: 34 }}
              >
                <span aria-hidden>{soundOn ? "🔔" : "🔕"}</span>
                <span className="label" style={{ marginLeft: 6 }}>{soundOn ? "Som" : "Silêncio"}</span>
              </button>
            </Tip>

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

      {/* TOASTER */}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 50,
          display: "grid",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastCard
            key={t.id}
            toast={t}
            onClose={() => setToasts((curr) => curr.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>

      {/* CSS inline */}
      <style jsx global>{`
        @keyframes fp-toast-in {
          0% { transform: translateY(-8px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fp-toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .fp-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 6px 10px;
          background: transparent;
          cursor: pointer;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .fp-pill:hover { transform: translateY(-1px); }
        .fp-pill:active { transform: translateY(0); }
      `}</style>
    </>
  );
}

// ------------- Toast UI -------------
function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <a
      href={toast.href || "/dashboard"}
      onClick={onClose}
      style={{
        pointerEvents: "auto",
        minWidth: 300,
        maxWidth: 420,
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--panel, var(--bg))",
        boxShadow: "0 10px 24px rgba(0,0,0,.18)",
        padding: 12,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        animation: "fp-toast-in 220ms ease-out",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, marginBottom: 2, fontSize: ".98rem" }}>
          {toast.title}
        </div>
        {toast.body && (
          <div style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.3 }}>
            {toast.body}
          </div>
        )}
        <div
          aria-hidden
          style={{
            height: 3,
            borderRadius: 999,
            background: "color-mix(in srgb, var(--accent, #22c55e) 40%, transparent)",
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--accent, #22c55e)",
              animation: "fp-toast-progress 6s linear forwards",
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClose(); }}
        aria-label="Fechar notificação"
        title="Fechar"
        style={{
          alignSelf: "start",
          border: "1px solid var(--border)",
          background: "transparent",
          borderRadius: 8,
          width: 28,
          height: 28,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          color: "inherit",
        }}
      >
        ×
      </button>
    </a>
  );
}
