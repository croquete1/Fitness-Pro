// src/app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Iniciar sessão</h1>
      <Suspense fallback={<div className="text-sm opacity-70">A carregar…</div>}>
        <LoginClient />
      </Suspense>
    </div>
  );
}
