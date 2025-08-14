// src/app/(app)/dashboard/messages/page.tsx
export const metadata = { title: "Mensagens · Dashboard" };

async function getMessages() {
  const res = await fetch("/api/dashboard/messages", {
    cache: "no-store",
    // next: { revalidate: 0 } // opcional, redundante com no-store
  });
  if (!res.ok) throw new Error("Não foi possível obter as mensagens");
  return res.json();
}

export default async function MessagesPage() {
  const data = await getMessages();
  const items: Array<{
    id: string; from: string; subject: string; preview: string; createdAt: string; unread: boolean;
  }> = data.items ?? [];

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Mensagens</h1>

      <ul style={{ display: "grid", gap: 8 }}>
        {items.map((m) => (
          <li
            key={m.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: ".75rem .9rem",
              background: m.unread ? "var(--chip)" : "transparent",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <strong style={{ lineHeight: 1.2 }}>{m.subject}</strong>
              <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: ".9rem", color: "var(--muted)", marginTop: 6 }}>
              <em>{m.from}</em> — {m.preview}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
