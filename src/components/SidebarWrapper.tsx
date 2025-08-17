"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const KEY = "fp.sidebar.state";
type Persisted = { collapsed: boolean; pinned: boolean };

const readState = (): Persisted => {
  try {
    const j = localStorage.getItem(KEY);
    if (!j) return { collapsed: false, pinned: true };
    const p = JSON.parse(j);
    return { collapsed: !!p.collapsed, pinned: p.pinned ?? true };
  } catch { return { collapsed: false, pinned: true }; }
};
const saveState = (s: Persisted) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => { const s = readState(); setCollapsed(s.collapsed); setPinned(s.pinned); }, []);

  // aplica atributo para CSS controlar a largura
  useEffect(() => {
    const html = document.documentElement;
    const rail = collapsed && !(hovering && !pinned);
    if (rail) html.setAttribute("data-sb", "collapsed");
    else html.removeAttribute("data-sb");
  }, [collapsed, hovering, pinned]);

  // persiste
  useEffect(() => { saveState({ collapsed, pinned }); }, [collapsed, pinned]);

  // se solta, forçamos recolhida por defeito
  useEffect(() => { if (!pinned) setCollapsed(true); }, [pinned]);

  const toggleCollapse = () => setCollapsed(v => !v);   // funciona mesmo quando pinned=true
  const togglePin = () => setPinned(v => !v);

  const rail = collapsed && !(hovering && !pinned);

  return (
    <div className="fp-shell">
      <aside
        className="fp-sidebar"
        onMouseEnter={() => !pinned && setHovering(true)}
        onMouseLeave={() => !pinned && setHovering(false)}
        style={{ boxShadow: (!pinned && hovering) ? "0 10px 30px rgba(0,0,0,.18)" : undefined }}
      >
        <div className="inner">
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 10px 6px" }}>
            <div className="nav-item" style={{ padding:0, background:"transparent", cursor:"default" }}>
              <div className="nav-icon" aria-hidden>🏋️‍♂️</div>
              <div className="nav-label" style={{ fontWeight:800, fontSize:18 }}>Menu</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" title={pinned ? "Desafixar" : "Afixar"} onClick={togglePin} type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2l8 8-4 4-8-8 4-4z"/><path d="M2 22l10-10"/>
                </svg>
                <span className="nav-label">{pinned ? "Afixada" : "Solta"}</span>
              </button>
              <button className="btn" onClick={toggleCollapse} title={rail ? "Expandir" : "Recolher"} type="button">
                {rail
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 6l-6 6 6 6"/></svg>}
                <span className="nav-label">{rail ? "Expandir" : "Recolher"}</span>
              </button>
            </div>
          </div>

          {/* Navegação com scroll isolado */}
          <div className="nav-scroll">
            <Sidebar rail={rail} />
          </div>

          {/* Footer */}
          <div style={{ padding:10 }}>
            <form action="/api/auth/signout" method="post">
              <button className="btn" style={{ width:"100%", justifyContent:"center" }}>Terminar sessão</button>
            </form>
          </div>
        </div>
      </aside>

      <main className="fp-content">{children}</main>
      <div className="fp-overlay" />
    </div>
  );
}
