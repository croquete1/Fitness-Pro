"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { key: "overview", label: "Resumo" },
  { key: "workouts", label: "Treinos" },
  { key: "clients", label: "Clientes" },
  { key: "admin", label: "Administração" },
];

export default function Tabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const initialTab = useMemo(() => {
    if (!tabParam) return "overview";
    return TABS.some(t => t.key === tabParam) ? tabParam : "overview";
  }, [tabParam]);

  const [active, setActive] = useState(initialTab);
  useEffect(() => setActive(initialTab), [initialTab]);

  function onSelect(key: string) {
    setActive(key);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    router.push(url.pathname + "?" + url.searchParams.toString());
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={
              "rounded-xl border px-3 py-1 text-sm " +
              (active === t.key ? "bg-black text-white" : "bg-white")
            }
            aria-pressed={active === t.key}
            aria-current={active === t.key ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border p-4">
        {active === "overview" && <Overview />}
        {active === "workouts" && <Workouts />}
        {active === "clients" && <Clients />}
        {active === "admin" && <Admin />}
      </section>
    </div>
  );
}

function Overview() { return (<div className="space-y-2"><h2 className="text-lg font-medium">Resumo</h2><p className="text-sm text-neutral-600">Bem‑vindo! Esta é a aba inicial por omissão.</p></div>); }
function Workouts() { return (<div className="space-y-2"><h2 className="text-lg font-medium">Treinos</h2><p className="text-sm text-neutral-600">Conteúdo dos treinos…</p></div>); }
function Clients() { return (<div className="space-y-2"><h2 className="text-lg font-medium">Clientes</h2><p className="text-sm text-neutral-600">Lista de clientes…</p></div>); }
function Admin() { return (<div className="space-y-2"><h2 className="text-lg font-medium">Administração</h2><p className="text-sm text-neutral-600">Aceda apenas quando necessário; não é a aba predefinida.</p></div>); }
