// src/app/(app)/dashboard/settings/page.tsx
"use client";

export default function SettingsPage() {
  return (
    <main className="fp-page" style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Definições</h1>
      <p style={{ color: "var(--muted)" }}>Configurações gerais do sistema. (placeholder)</p>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg)", padding: 12 }}>
        Em breve: branding, emails, segurança e backups.
      </div>
    </main>
  );
}
