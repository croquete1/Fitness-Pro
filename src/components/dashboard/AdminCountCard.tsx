"use client";

import { useEffect, useState } from "react";

export default function AdminCountCard() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard/stats")
      .then(async (r) => {
        if (!r.ok) throw new Error("Erro ao carregar estatísticas");
        const data = await r.json();
        if (alive) setCount(Number(data?.users?.admins ?? 0));
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-sm text-neutral-500">Administradores</div>
      <div className="mt-1 text-3xl font-semibold">
        {error ? "—" : count ?? "…"}
      </div>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}