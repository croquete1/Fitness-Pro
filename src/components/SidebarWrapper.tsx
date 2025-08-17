"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const KEY = "fp.sidebar.state"; // {collapsed:boolean, pinned:boolean}

type Persisted = { collapsed: boolean; pinned: boolean };

function readState(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { collapsed: false, pinned: true };
    const j = JSON.parse(raw);
    return { collapsed: !!j.collapsed, pinned: j.pinned ?? true };
  } catch {
    return { collapsed: false, pinned: true };
  }
}

function saveState(s: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [hovering, setHovering] = useState(false);

  // hidratar do localStorage
  useEffect(() => {
    const s = readState();
    setCollapsed(s.collapsed);
    setPinned(s.pinned);
  }, []);

  // aplicar atributo no <html> para o CSS controlar a largura da coluna
  useEffect(() => {
    const html = document.documentElement;
    if (collapsed && !hovering) html.setAttribute("data-sb", "collapsed");
    else html.removeAttribute("data-sb");
  }, [collapsed, hovering]);

  // guardar preferências
  useEffect(() => {
    saveState({ collapsed, pinned });
  }, [collapsed, pinned]);

  // se “solta”, mantém recolhida e expande só no hover
  useEffect(() => {
    if (!pinned) setCollapsed(true);
  }, [pinned]);

  const toggleCollapse = () => setCollapsed((v) => !v);
  const togglePin = () => setPinned((v) => !v);

  const rail = collapsed && !hovering;

  return (
    <div className="fp-shell">
      {/* ===== Sidebar ===== */}
      <aside
        className="fp-sidebar"
        onMouseEnter={() => !pinned && setHovering(true)}
        onMouseLeave={() => !pinned && setHovering(false)}
        style={{ boxShadow: hovering && !pinned ? "0 10px 30px rgba(0,0,0,.18)" : undefined }}
      >
        <div className="inner">
          {/* Header da sidebar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 12px 8px",
            }}
          >
            <div className="nav-item" style={{ padding: 0, background: "transparent", cursor: "default" }}>
              <div className="nav-icon" aria-hidden>
                🏋️‍♂️
              </div>
              <div className="nav-label" style={{ fontWeight: 800, fontSize: 18 }}>
                Menu
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Afixar/Desafixar */}
              <button
                className="btn"
                title={pinned ? "Desafixar" : "Afixar"}
                onClick={togglePin}
                type="button"
              >
                {/* ícone pin / pin-off */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2l8 8-4 4-8-8 4-4z" />
                  <path d="M2 22l10-10" />
                </svg>
                <span className="nav-label">{pinned ? "Afixada" : "Solta"}</span>
              </button>

              {/* Recolher/Expandir */}
              <button
                className="btn"
                onClick={toggleCollapse}
                title={rail ? "Expandir" : "Recolher"}
                type="button"
              >
                {rail ? (
                  // chevron-right
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                ) : (
                  // chevron-left
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                )}
                <span className="nav-label">{rail ? "Expandir" : "Recolher"}</span>
              </button>
            </div>
          </div>

          {/* Navegação com scroll isolado */}
          <div className="nav-scroll">
            <Sidebar rail={rail} />
          </div>

          {/* Footer: Terminar sessão */}
          <div style={{ padding: 12 }}>
            <form action="/api/auth/signout" method="post">
              <button className="btn" style={{ width: "100%", justifyContent: "center" }}>
                Terminar sessão
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="fp-content">{children}</main>

      {/* Overlay mobile (controlado por css via html[data-sidebar="open"]) */}
      <div className="fp-overlay" />
    </div>
  );
}
