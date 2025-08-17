"use client";

import React from "react";

export default function Toasts({
  items,
  onDismiss,
}: {
  items: { id: string; title: string; body?: string }[];
  onDismiss: (id: string) => void;
}) {
  if (!items?.length) return null;

  return (
    <div className="fp-toasts">
      {items.map((a) => (
        <div key={a.id} className="fp-toast">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong style={{ flex: 1 }}>{a.title}</strong>
            <button
              onClick={() => onDismiss(a.id)}
              className="pill"
              style={{ padding: "4px 8px" }}
            >
              Fechar
            </button>
          </div>
          {a.body && (
            <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
              {a.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
