// src/app/register/page.tsx
import RegisterClient from "./RegisterClient";

export const metadata = {
  title: "Registar · Fitness Pro",
  description: "Crie a sua conta Fitness Pro.",
};

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
          background: "var(--bg)",
          boxShadow: "0 6px 24px rgba(0,0,0,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--border)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            FP
          </div>
          <div>
            <div style={{ fontWeight: 800, lineHeight: 1 }}>Fitness Pro</div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>Criar conta</div>
          </div>
        </div>

        <RegisterClient />
      </div>
    </div>
  );
}
