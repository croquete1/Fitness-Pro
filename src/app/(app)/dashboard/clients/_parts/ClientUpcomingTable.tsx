// Server Component
import * as React from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { pt } from "date-fns/locale";

import { createServerClient } from "@/lib/supabaseServer";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { getClientDashboardFallback } from "@/lib/fallback/client-dashboard";

type StatusTone = "ok" | "warn" | "down";

type TableRow = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  relative: string;
  location: string | null;
  trainerName: string | null;
  status: string | null;
  tone: StatusTone;
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

function friendlyStatus(value: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toneForStatus(value: string | null): StatusTone {
  const status = (value ?? "").toString().toUpperCase();
  if (["CONFIRMED", "COMPLETED", "ACTIVE"].includes(status)) return "ok";
  if (["PENDING", "REQUESTED", "WAITING", "RESCHEDULE"].includes(status)) return "warn";
  if (!status) return "warn";
  return "down";
}

function formatRelative(value: string | null) {
  if (!value) return "—";
  try {
    return formatDistanceToNowStrict(new Date(value), { addSuffix: true, locale: pt });
  } catch {
    return "—";
  }
}

function resolveTrainerName(row: any): string | null {
  if (!row) return null;
  if (Array.isArray(row)) {
    for (const entry of row) {
      const name = resolveTrainerName(entry);
      if (name) return name;
    }
    return null;
  }
  if (typeof row !== "object") return null;
  const candidates = [row.full_name, row.display_name, row.name, row.first_name];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

export default async function ClientUpcomingTable() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) return null;

  const supabase = createServerClient();
  const now = new Date();
  let source: "supabase" | "fallback" = "fallback";
  let rows: TableRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("sessions")
      .select(
        "id,scheduled_at,location,client_attendance_status,trainer:trainer_id(id,full_name,display_name,first_name,name)"
      )
      .eq("client_id", me.id)
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(8);

    if (Array.isArray(data)) {
      source = "supabase";
      rows = (data as Array<Record<string, any>>).slice(0, 6).map((session) => {
        const scheduled = session.scheduled_at ? new Date(session.scheduled_at) : null;
        const dayLabel = scheduled ? dateFormatter.format(scheduled) : "—";
        const timeLabel = scheduled ? timeFormatter.format(scheduled) : "—";
        const status = (session.client_attendance_status ?? null) as string | null;
        return {
          id: session.id,
          dayLabel,
          timeLabel,
          relative: formatRelative(session.scheduled_at),
          location: session.location ?? null,
          trainerName: resolveTrainerName(session.trainer),
          status,
          tone: toneForStatus(status),
        } satisfies TableRow;
      });
    }
  }

  if (!rows.length) {
    const fallback = getClientDashboardFallback(me.id, 30);
    rows = fallback.sessions
      .filter((session) => {
        const scheduled = session.scheduledAt ? new Date(session.scheduledAt) : null;
        return scheduled ? scheduled >= now : false;
      })
      .slice(0, 6)
      .map((session) => ({
        id: session.id,
        dayLabel: session.dayLabel,
        timeLabel: session.timeLabel,
        relative: session.relative,
        location: session.location,
        trainerName: session.trainerName,
        status: session.status,
        tone: toneForStatus(session.status),
      }));
    source = "fallback";
  }

  return (
    <section className="neo-panel client-dashboard__panel" aria-labelledby="client-upcoming-heading">
      <header className="neo-panel__header">
        <div className="neo-panel__meta">
          <h2 id="client-upcoming-heading" className="neo-panel__title">
            Próximas sessões
          </h2>
          <p className="neo-panel__subtitle">
            Até seis compromissos futuros confirmados. Fonte: {source === "supabase" ? "servidor remoto" : "sem dados sincronizados"}.
          </p>
        </div>
        <div className="neo-panel__actions neo-panel__actions--table">
          <Link
            href="/dashboard/sessions"
            prefetch={false}
            className="btn client-upcoming__action"
            data-variant="ghost"
            data-size="sm"
          >
            Ver agenda
          </Link>
        </div>
      </header>

      <div className="neo-table-wrapper" role="region" aria-live="polite">
        <table className="neo-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Local</th>
              <th>Estado</th>
              <th>PT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((session) => (
              <tr key={session.id}>
                <td>
                  <div className="client-upcoming__date">
                    <span>{session.dayLabel}</span>
                    <span>{session.timeLabel}</span>
                  </div>
                  <span className="client-upcoming__relative">{session.relative}</span>
                </td>
                <td>
                  <span className="client-upcoming__muted">{session.location ?? "—"}</span>
                </td>
                <td>
                  <span className="status-pill" data-state={session.tone}>
                    {friendlyStatus(session.status)}
                  </span>
                </td>
                <td>
                  <span className="client-upcoming__muted">{session.trainerName ?? "—"}</span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4}>
                  <div className="neo-empty" role="status">
                    <span className="neo-empty__icon" aria-hidden>
                      🗓️
                    </span>
                    <p className="neo-empty__title">Sem sessões futuras</p>
                    <p className="neo-empty__description">
                      Ainda não existe qualquer compromisso sincronizado com o servidor.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
