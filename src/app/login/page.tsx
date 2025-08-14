// src/app/login/page.tsx
import LoginClient from "./LoginClient";
import Logo from "@/components/layout/Logo";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Iniciar sessão · " + brand.name,
  description: "Aceda à sua conta " + brand.name + ".",
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
          <Logo size={36} />
          <div>
            <div style={{ fontWeight: 800, lineHeight: 1 }}>{brand.name}</div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>Iniciar sessão</div>
          </div>
        </div>

        <LoginClient registered={registered} />
      </div>
    </div>
  );
}
