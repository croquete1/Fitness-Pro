"use client";

export default function KpiCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon?: string;
  loading?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 14,
        background: "var(--bg)",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid var(--border)",
          display: "grid",
          placeItems: "center",
          fontSize: 18,
        }}
      >
        {icon ?? "•"}
      </div>
      <div>
        <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: "1.25rem", minHeight: 22 }}>
          {loading ? "…" : value}
        </div>
      </div>
    </div>
  );
}
