"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}                         /* clica fora = fechar */
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(0,0,0,.35)", backdropFilter: "blur(2px)",
        display: "grid", placeItems: "center",
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}     /* clicar no conteúdo não fecha */
        className="card"
        style={{ width: "min(640px, 94vw)", padding: 16, borderRadius: 16 }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
