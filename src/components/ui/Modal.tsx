"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Título opcional: usado no header do modal */
  title?: React.ReactNode;
  /** Conteúdo do footer (botões, etc.) – opcional */
  footer?: React.ReactNode;
  /** Tamanho opcional */
  size?: "sm" | "md" | "lg";
  /** Mostrar botão X no canto (true por defeito) */
  showClose?: boolean;
  children: React.ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  footer,
  size = "md",
  showClose = true,
  children,
}: ModalProps) {
  // fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW =
    size === "sm" ? "480px" : size === "lg" ? "880px" : "640px";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose} /* clicar fora = fechar */
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,.35)",
        backdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        padding: 12,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()} /* clicar dentro não fecha */
        style={{
          width: "min(94vw, " + maxW + ")",
          borderRadius: 16,
          padding: 0,
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn"
                aria-label="Fechar"
                title="Fechar"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 16 }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
