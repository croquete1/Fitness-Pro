"use client";

import * as React from "react";
import { CalendarDays, Clock } from "lucide-react";

type ApiSession = {
  id: string;
  scheduledAt: string;
  status?: string | null;
  notes?: string | null;
  trainer: { id: string; name: string | null; email: string };
  client: { id: string; name: string | null; email: string };
};

function dateLabel(date: Date, base: Date = new Date(), locale = "pt-PT") {
  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const d = toYMD(date);
  const today = toYMD(base);
  const tmr = toYMD(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1));
  const yst = toYMD(new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1));
  if (d === today) return "Hoje";
  if (d === tmr) return "Amanhã";
  if (d === yst) return "Ontem";
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "short" });
  const s = fmt.format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MiniAgenda() {
  const [items, setItems] = React.useState<ApiSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch("/api/trainer/sessions?range=7d", { cache: "no-store" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { sessions: ApiSession[] };
        if (!abort) {
          const arr = [...(data.sessions || [])]
            .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
            .slice(0, 5);
          setItems(arr);
        }
      } catch (e: any) {
        if (!abort) setErr(e?.message || "Falha a carregar");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-transparent p-4 shadow-sm">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        <h3 className="text-sm font-semibold">Próximas sessões (7 dias)</h3>
      </div>

      {loading && (
        <div className="mt-3 text-sm text-muted-foreground">A carregar…</div>
      )}
      {err && !loading && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</div>
      )}
      {!loading && !err && items.length === 0 && (
        <div className="mt-3 text-sm text-muted-foreground">Sem sessões.</div>
      )}

      {!loading && !err && items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((s) => {
            const d = new Date(s.scheduledAt);
            const day = dateLabel(d);
            const time = new Intl.DateTimeFormat("pt-PT", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(d);
            return (
              <li
                key={s.id}
                className="group rounded-xl border bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:bg-card hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {s.client.name || s.client.email}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      PT: {s.trainer.name || s.trainer.email}
                      {s.status ? ` • ${s.status}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm">
                      <Clock className="h-4 w-4 opacity-70" />
                      <span className="font-medium">{time}</span>
                    </div>
                    <div className="text-xs opacity-70">{day}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
