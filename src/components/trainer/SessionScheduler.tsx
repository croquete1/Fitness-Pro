"use client";

import * as React from "react";
import Reveal from "@/components/anim/Reveal";
import { dateLabel } from "@/lib/dateLabels";

type ApiSession = {
  id: string;
  scheduledAt: string; // ISO
  status?: string | null;
  notes?: string | null;
  trainer: { id: string; name: string | null; email: string };
  client: { id: string; name: string | null; email: string };
};

type Group = {
  key: string; // YYYY-MM-DD
  date: Date;
  label: string; // Hoje / Amanhã / Ontem / data formatada
  items: ApiSession[];
};

export default function SessionScheduler() {
  const [sessions, setSessions] = React.useState<ApiSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<"today" | "7d" | "30d">("7d");

  React.useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/trainer/sessions?range=${range}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { sessions: ApiSession[] };
        if (!aborted) setSessions(data.sessions ?? []);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Falha a carregar sessões");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [range]);

  const groups = React.useMemo<Group[]>(() => {
    const toYMD = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const map = new Map<string, Group>();
    const now = new Date();

    for (const s of sessions) {
      const d = new Date(s.scheduledAt);
      const key = toYMD(d);
      if (!map.has(key)) {
        map.set(key, { key, date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), label: dateLabel(d, now), items: [] });
      }
      map.get(key)!.items.push(s);
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => a.date.getTime() - b.date.getTime());
    // ordenar itens por hora
    for (const g of arr) {
      g.items.sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return arr;
  }, [sessions]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Reveal variant="fade">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Sessões agendadas</h2>
          <div className="flex items-center gap-2">
            <RangeButton value="today" current={range} onChange={setRange}>
              Hoje
            </RangeButton>
            <RangeButton value="7d" current={range} onChange={setRange}>
              7 dias
            </RangeButton>
            <RangeButton value="30d" current={range} onChange={setRange}>
              30 dias
            </RangeButton>
          </div>
        </div>
      </Reveal>

      {/* Estados */}
      {loading && (
        <Reveal>
          <div className="rounded-xl border p-6 text-sm text-muted">
            A carregar sessões…
          </div>
        </Reveal>
      )}
      {error && !loading && (
        <Reveal>
          <div className="rounded-xl border p-6 text-sm text-danger">
            {error}
          </div>
        </Reveal>
      )}
      {!loading && !error && groups.length === 0 && (
        <Reveal>
          <div className="rounded-xl border p-6 text-sm text-muted">
            Sem sessões no período selecionado.
          </div>
        </Reveal>
      )}

      {/* Lista agrupada por dia com cabeçalhos "Hoje / Amanhã / Ontem" */}
      {!loading && !error && groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((g, i) => (
            <Reveal key={g.key} delay={i * 40}>
              <div className="space-y-3">
                <div className="sticky top-0 z-10 -mx-2 px-2 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <h3 className="text-sm font-medium opacity-70">{g.label}</h3>
                </div>
                <ul className="space-y-2">
                  {g.items.map((s) => {
                    const at = new Date(s.scheduledAt);
                    const time = new Intl.DateTimeFormat("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(at);

                    return (
                      <li
                        key={s.id}
                        className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium">{time}</span>{" "}
                              • {s.client.name || s.client.email}
                            </div>
                            <div className="text-xs text-muted">
                              PT: {s.trainer.name || s.trainer.email}
                              {s.status ? ` • ${s.status}` : null}
                              {s.notes ? ` • ${s.notes}` : null}
                            </div>
                          </div>
                          {/* (futuro) ações rápidas */}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeButton({
  value,
  current,
  onChange,
  children,
}: {
  value: "today" | "7d" | "30d";
  current: string;
  onChange: (v: "today" | "7d" | "30d") => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={[
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "hover:bg-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
