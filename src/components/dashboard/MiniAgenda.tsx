"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "TRAINER" | "CLIENT";

type UserLite = { id: string; name: string | null; email: string };
type SessionItem = {
  id: string;
  scheduledAt: string;
  status: string | null;
  trainer: UserLite;
  client: UserLite;
};

type RangeKey = "today" | "7d" | "30d";

export default function MiniAgenda({ role }: { role: Role | undefined }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(`/api/trainer/sessions?range=${range}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Falha a carregar sessões");
        const data = await r.json();
        if (!ignore) setItems(data.sessions ?? []);
      })
      .catch((e) => !ignore && setError(e.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [range]);

  const title = useMemo(() => {
    if (role === "ADMIN") return "A ver: todas as sessões";
    if (role === "TRAINER") return "A ver: as minhas sessões";
    return "A ver: as minhas sessões";
  }, [role]);

  const onCancel = async (id: string) => {
    if (!confirm("Cancelar esta sessão?")) return;
    const res = await fetch("/api/trainer/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelada" }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "cancelada" } : i)));
    } else {
      alert("Falha ao cancelar sessão");
    }
  };

  const openReschedule = (it: SessionItem) => {
    setEditingId(it.id);
    // ISO 8601 local (yyyy-MM-ddThh:mm) esperado por input[type=datetime-local]
    const dt = new Date(it.scheduledAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setPendingDate(local);
  };

  const confirmReschedule = async () => {
    if (!editingId || !pendingDate) return;
    const res = await fetch("/api/trainer/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, scheduledAt: pendingDate }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, scheduledAt: new Date(pendingDate).toISOString() } : i))
      );
      setEditingId(null);
    } else {
      alert("Falha ao remarcar sessão");
    }
  };

  return (
    <section className="rounded-2xl border bg-card/60 backdrop-blur py-4">
      <div className="px-4 pb-3 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold tracking-tight">Próximas sessões</h2>
        <div className="flex items-center gap-2">
          <RangeButton label="Hoje" active={range === "today"} onClick={() => setRange("today")} />
          <RangeButton label="7 dias" active={range === "7d"} onClick={() => setRange("7d")} />
          <RangeButton label="30 dias" active={range === "30d"} onClick={() => setRange("30d")} />
        </div>
      </div>
      <div className="px-4 pb-2 text-xs text-muted-foreground">{title}</div>

      {loading ? (
        <AgendaSkeleton />
      ) : error ? (
        <div className="px-4 py-6 text-sm text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">Sem sessões agendadas.</div>
      ) : (
        <ul className="divide-y">
          {items.map((s) => {
            const dt = new Date(s.scheduledAt);
            const date = dt.toLocaleDateString("pt-PT", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            });
            const time = dt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

            const withWho =
              role === "TRAINER"
                ? s.client.name ?? s.client.email
                : role === "CLIENT"
                ? s.trainer.name ?? s.trainer.email
                : `${s.trainer.name ?? s.trainer.email} → ${s.client.name ?? s.client.email}`;

            const editing = editingId === s.id;

            return (
              <li key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border flex flex-col items-center justify-center bg-background">
                      <span className="text-[10px] uppercase text-muted-foreground">{date.split(",")[0]}</span>
                      <span className="text-base font-semibold">{date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-none">{withWho}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {time} • {s.status ?? "pendente"}
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2">
                    {!editing ? (
                      <>
                        <button
                          onClick={() => openReschedule(s)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted transition"
                        >
                          Remarcar
                        </button>
                        <button
                          onClick={() => onCancel(s.id)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={pendingDate}
                          onChange={(e) => setPendingDate(e.target.value)}
                          className="text-xs rounded-md border px-2 py-1 bg-background"
                        />
                        <button
                          onClick={confirmReschedule}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RangeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-1.5 text-xs transition",
        active ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function AgendaSkeleton() {
  return (
    <ul className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border bg-muted animate-pulse" />
              <div>
                <div className="h-3 w-40 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-muted mt-2 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-20 rounded bg-muted animate-pulse" />
              <div className="h-7 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
