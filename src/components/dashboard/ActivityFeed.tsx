"use client";

export type ActivityItem = {
  id: string | number;
  type?: string;        // ex: "user.created", "plan.updated"
  message?: string;     // ex: "Novo utilizador registado"
  createdAt?: string;   // ISO
  at?: string;          // fallback
  who?: string;
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const d = Math.floor(hrs / 24);
  return `${d} d`;
}

export default function ActivityFeed({
  items,
  emptyText = "Sem atividade.",
}: {
  items: ActivityItem[];
  emptyText?: string;
}) {
  if (!items?.length) {
    return <p style={{ color: "var(--muted)", marginTop: 8 }}>{emptyText}</p>;
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "grid", gap: 8 }}>
      {items.map((a) => (
        <li
          key={String(a.id)}
          style={{
            display: "grid",
            gridTemplateColumns: "24px 1fr auto",
            gap: 10,
            alignItems: "center",
            padding: "8px 6px",
            borderBottom: "1px dashed var(--border)",
          }}
        >
          <span aria-hidden style={{ fontSize: 16 }}>
            {a.type?.includes("user")
              ? "👤"
              : a.type?.includes("session")
              ? "🗓️"
              : a.type?.includes("plan")
              ? "📘"
              : "•"}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {a.message ?? a.type ?? "Evento"}
            </div>
            {a.who ? <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{a.who}</div> : null}
          </div>
          <small style={{ color: "var(--muted)" }}>{timeAgo(a.createdAt ?? a.at)}</small>
        </li>
      ))}
    </ul>
  );
}
