// src/app/login/page.tsx
import LoginClient from "./LoginClient";

export default function LoginPage() {
  // Camada própria para o login, fixa ao viewport e centrada
  return (
    <div
      data-auth-root
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "var(--bg)",
        zIndex: 0, // abaixo de qualquer overlay futuro
      }}
    >
      <LoginClient />
    </div>
  );
}
