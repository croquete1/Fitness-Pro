"use client";

import { useEffect, useState } from "react";

type ApiStats = {
  clientes?: number;
  admins?: number;
  pts?: number;        // algumas versões usavam "pts"
  trainers?: number;   // ou "trainers"
};

export default function AdminCountCard() {
  const [stats, setStats] = useState<{ clientes: number; trainers: number; admins: number }>({
    clientes: 0,
    trainers: 0,
    admins: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/dashboard/stats", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Falha a carregar dados");

        const json: ApiStats = await res.json();
        if (cancelled) return;

        setStats({
          clientes: json.clientes ?? 0,
          trainers: (json.trainers ?? json.pts) ?? 0,
          admins: json.admins ?? 0,
        });
        setError(null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erro ao obter estatísticas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card label="Clientes" value={stats.clientes} loading={loading} error={error} />
      <Card label="Treinadores" value={stats.trainers} loading={loading} error={error} />
      <Card label="Admins" value={stats.admins} loading={loading} error={error} />
    </div>
  );
}

function Card({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: number;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-3xl font-bold">
        {loading ? "—" : error ? "!" : value}
      </div>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}
