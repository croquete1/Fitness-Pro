// src/app/login/page.tsx
import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // evita pré-renderização problemática nesta página
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>A carregar…</div>}>
      <LoginClient />
    </Suspense>
  );
}
