// src/components/Notifications.tsx
"use client";

import React from "react";

type Notification = {
  id: string;
  title: string;
  createdAt: string;
  unread: boolean;
  handled: boolean;
};

export default function NotificationsPanel() {
  const [list, setList] = React.useState<Notification[]>([
    { id: "1", title: "Novos registos", createdAt: new Date().toISOString(), unread: true, handled: false },
  ]);
  const [dnd, setDnd] = React.useState(false);
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  const markHandled = (id: string) => {
    setList((prev) => prev.map((n) => (n.id === id ? { ...n, handled: true, unread: false } : n)));
  };

  const snooze = (minutes: number) => {
    // Placeholder: trocar por agendamento server-side quando ligarmos backend
    setDnd(true);
    // eslint-disable-next-line no-console
    console.log("DND +", minutes, "min");
    window.setTimeout(() => setDnd(false), minutes * 60 * 1000);
  };

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Notificações</h2>
        <label title="Ativar/Desativar 'Não incomodar'" style={{ display: "inline-flex", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={dnd} onChange={(e) => setDnd(e.target.checked)} />
          <span>Não incomodar</span>
        </label>
      </div>

      <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
        {list.map((n) => (
          <li
            key={n.id}
            style={{ position: "relative", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff", marginBottom: 8 }}
            onMouseEnter={() => setHoverId(n.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {n.unread && !n.handled && (
                  <span
                    aria-label="não lida"
                    style={{ display: "inline-block", height: 8, width: 8, borderRadius: 9999, background: "#ef4444" }}
                  />
                )}
                <button
                  onClick={() => markHandled(n.id)}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Marcar como tratado
                </button>
              </div>
            </div>

            {hoverId === n.id && (
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: 44,
                  zIndex: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: 12,
                  width: 260,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Agendar lembrete</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn} onClick={() => snooze(15)}>+15 min</button>
                  <button style={btn} onClick={() => snooze(60)}>+1 h</button>
                  <button style={btn} onClick={() => snooze(240)}>+4 h</button>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  Sugestão: clique para definir outro horário personalizado.
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const btn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  padding: "6px 10px",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};
