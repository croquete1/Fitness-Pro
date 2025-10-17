// Server Component
import * as React from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabaseServer";
import { getSessionUserSafe } from "@/lib/session-bridge";

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
    <section className="neo-panel space-y-4" aria-labelledby="client-upcoming-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="client-upcoming-heading" className="neo-panel__title">
            Próximas sessões
          </h2>
          <p className="neo-panel__subtitle">Até seis compromissos futuros confirmados.</p>
        </div>
        <Link href="/dashboard/sessions" className="btn ghost" prefetch={false}>
          Ver agenda
        </Link>
      </div>

      <div className="neo-table-wrapper">
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
            {rows.map((session) => {
              const formattedDate = session.scheduled_at
                ? new Date(session.scheduled_at).toLocaleString("pt-PT")
                : "—";
              return (
                <tr key={session.id}>
                  <td>{formattedDate}</td>
                  <td>{session.location ?? "—"}</td>
                  <td>{session.status ?? "—"}</td>
                  <td>{session.trainer_id ?? "—"}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={4}>
                  <div className="neo-empty">
                    <span className="neo-empty__icon" aria-hidden>
                      🗓️
                    </span>
                    <p className="neo-empty__title">Sem sessões marcadas</p>
                    <p className="neo-empty__description">
                      Quando o teu PT confirmar novos treinos, surgem aqui automaticamente.
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
