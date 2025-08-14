// src/app/login/page.tsx
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Iniciar sessão · Fitness Pro",
  description: "Aceda à sua conta Fitness Pro.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const registered =
    (typeof searchParams?.registered === "string" && searchParams?.registered === "1") ||
    (Array.isArray(searchParams?.registered) && searchParams?.registered?.[0] === "1");

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
          maxWidth: 440,
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
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>Iniciar sessão</div>
          </div>
        </div>

        <LoginClient registered={registered} />
      </div>
    </div>
  );
}
