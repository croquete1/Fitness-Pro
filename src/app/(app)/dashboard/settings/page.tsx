"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Definições</h1>

      <div className="card" style={{ padding: 16, display: "grid", gap: 12, maxWidth: 720 }}>
        <strong>Notificações</strong>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
          Receber por e-mail
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
          Receber push
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="pill" style={{ padding: "8px 12px", background: "var(--brand)", color: "#fff", borderColor: "transparent" }}>
            Guardar
          </button>
          <button className="pill" style={{ padding: "8px 12px" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
