// src/app/register/page.tsx
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Criar conta</h1>
      <Suspense fallback={<div className="text-sm opacity-70">A carregar…</div>}>
        <RegisterClient />
      </Suspense>
    </div>
  );
}
