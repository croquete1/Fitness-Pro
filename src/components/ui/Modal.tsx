"use client";

import React, { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: number;
};

export default function Modal({ open, title, onClose, footer, children, maxWidth = 640 }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div aria-modal role="dialog" aria-label={title ?? "Janela"} style={{
      position: "fixed", inset: 0, zIndex: 80,
      display: "grid", placeItems: "center",
      background: "rgba(0,0,0,.35)", backdropFilter: "blur(2px)"
    }}>
      <div className="card" style={{
        width: "min(96vw, "+maxWidth+"px)", borderRadius: 16, overflow: "hidden",
        background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)"
      }}>
        <div style={{ padding: 14, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} className="pill" style={{ marginLeft: "auto", padding: "6px 10px" }}>Fechar</button>
        </div>
        <div style={{ padding: 14 }}>{children}</div>
        {footer && <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}
