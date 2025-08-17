// src/app/register/page.tsx
import RegisterClient from "./RegisterClient";
import Logo from "@/components/layout/Logo";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Registar · " + brand.name,
  description: "Crie a sua conta " + brand.name + ".",
};

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "calc(var(--header-h) + 1.25rem) 1rem 2rem",
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
          <Logo size={36} />
          <div>
            <div style={{ fontWeight: 800, lineHeight: 1 }}>{brand.name}</div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>Criar conta</div>
          </div>
        </div>

        <RegisterClient />
      </div>
    </div>
  );
}