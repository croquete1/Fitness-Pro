"use client";

export type AgendaItem = {
  id: string | number;
  when: string;      // ISO
  title: string;
  meta?: string;     // "Treinador → Cliente"
  href?: string;
};

function formatDayShort(iso: string) {
  const d = new Date(iso);
  const wd = d.toLocaleDateString("pt-PT", { weekday: "short" });
  const dt = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
  const tm = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  return { wd, dt, tm };
}

export default function MiniAgenda({
  items,
  emptyText = "Sem eventos.",
}: {
  items: AgendaItem[];
  emptyText?: string;
}) {
  if (!items?.length) {
    return <p style={{ color: "var(--muted)", marginTop: 8 }}>{emptyText}</p>;
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "grid", gap: 8 }}>
      {items.map((ev) => {
        const f = formatDayShort(ev.when);
        return (
          <li
            key={String(ev.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 10,
              alignItems: "center",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 10px",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid var(--border)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
              }}
              title={f.dt}
            >
              {f.wd.toUpperCase().slice(0, 3)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 600,
                }}
              >
                {ev.title}
              </div>
              {ev.meta ? (
                <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{ev.meta}</div>
              ) : null}
            </div>
            <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>{f.tm}</div>
          </li>
        );
      })}
    </ul>
  );
}
