// Server Component
import * as React from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabaseServer";
import { getSessionUserSafe } from "@/lib/session-bridge";

type StatusTone = "ok" | "warn" | "down";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return "—";
  }
}

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

export default async function ClientUpcomingTable() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) return null;

  const supabase = createServerClient();
  const now = new Date();

  const { data: upcomingRows } = await supabase
    .from("sessions")
    .select("id,scheduled_at,location,status,trainer_id")
    .eq("client_id", me.id)
    .gte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(6);

  const rows = upcomingRows ?? [];

  return (
    <section className="neo-panel client-dashboard__panel" aria-labelledby="client-upcoming-heading">
      <header className="neo-panel__header">
        <div className="neo-panel__meta">
          <h2 id="client-upcoming-heading" className="neo-panel__title">
            Próximas sessões
          </h2>
          <p className="neo-panel__subtitle">Até seis compromissos futuros confirmados.</p>
        </div>
        <div className="neo-panel__actions neo-panel__actions--table">
          <Link href="/dashboard/sessions" className="btn ghost" prefetch={false}>
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
                <td>{formatDate(session.scheduled_at)}</td>
                <td>
                  <span className="client-upcoming__muted">{session.location ?? "—"}</span>
                </td>
                <td>
                  <span className="status-pill" data-state={toneForStatus(session.status)}>
                    {friendlyStatus(session.status)}
                  </span>
                </td>
                <td>
                  <span className="client-upcoming__muted">{session.trainer_id ?? "—"}</span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4}>
                  <div className="neo-empty">
                    <span className="neo-empty__icon" aria-hidden>
                      🗓️
                    </span>
                    <p className="neo-empty__title">Sem sessões marcadas</p>
                    <p className="neo-empty__description">
                      Assim que o teu PT confirmar novos treinos, surgem aqui automaticamente.
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
