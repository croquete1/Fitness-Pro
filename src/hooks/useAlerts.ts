"use client";

import { useEffect, useRef, useState } from "react";
import { toAppRole } from "@/lib/roles";
import { useMe } from "./useMe";

type Alert = { id: string; title: string; body?: string; when?: number };

export function useAlerts() {
  const { user, loading } = useMe();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const last = useRef<{ approvals?: number; notifs?: number; since?: string }>({});

  useEffect(() => {
    if (loading) return;

    const role = user?.role ? toAppRole(user.role) : null;
    if (!user || !role) {
      last.current = {};
      setAlerts((prev) => (prev.length ? [] : prev));
      return;
    }

    const isAdmin = role === "ADMIN";
    const isTrainer = role === "PT";
    const allowed = isAdmin || isTrainer;

    if (!allowed) {
      last.current = {};
      setAlerts((prev) => (prev.length ? [] : prev));
      return;
    }

    let alive = true;
    last.current = {};

    async function tick() {
      try {
        const add: Alert[] = [];
        let approvals = last.current.approvals ?? 0;
        let notifs = last.current.notifs ?? 0;

        if (isAdmin) {
          const [a, n] = await Promise.all([
            fetch("/api/admin/approvals/count")
              .then((r) => (r.ok ? r.json() : { pending: 0 }))
              .catch(() => ({ pending: 0 })),
            fetch("/api/admin/notifications?limit=8")
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
          ]);
          approvals = Number(a?.pending ?? 0);
          notifs = Array.isArray(n) ? n.length : 0;

          if (last.current.approvals !== undefined && approvals > (last.current.approvals ?? 0)) {
            add.push({
              id: "appr:" + Date.now(),
              title: "Novos registos pendentes",
              body: `Tens ${approvals} aprovação(ões) por analisar.`,
            });
          }
          if (last.current.notifs !== undefined && notifs > (last.current.notifs ?? 0)) {
            add.push({
              id: "noti:" + Date.now(),
              title: "Novas notificações",
              body: `Recebeste ${notifs} notificações recentes.`,
            });
          }
        }

        const since = last.current.since ?? new Date(Date.now() - 60 * 1000).toISOString();
        const trainerFilter = isTrainer && user?.id ? `&trainerId=${encodeURIComponent(user.id)}` : "";
        const ev = await fetch(`/api/events?since=${encodeURIComponent(since)}${trainerFilter}`)
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .catch(() => ({ data: [] }));
        const events = Array.isArray(ev?.data) ? ev.data : [];
        if (events.length) {
          last.current.since = events[0]?.createdAt ?? new Date().toISOString();
          for (const e of events) {
            if (e.type === "PLAN_VIEWED") {
              add.push({
                id: `ev:${e.id}`,
                title: "Plano de treino visualizado",
                body: "Um cliente abriu o plano que lhe foi atribuído.",
              });
            } else if (e.type === "PLAN_UPDATED") {
              add.push({
                id: `ev:${e.id}`,
                title: "Plano de treino atualizado",
                body: "Um plano de treino foi alterado recentemente.",
              });
            } else if (e.type === "PLAN_ASSIGNED") {
              add.push({
                id: `ev:${e.id}`,
                title: "Cliente atribuído a PT",
                body: "Um cliente foi atribuído a um Personal Trainer.",
              });
            }
          }
        }

        if (alive && add.length) setAlerts((prev) => [...prev, ...add]);
        last.current.approvals = isAdmin ? approvals : undefined;
        last.current.notifs = isAdmin ? notifs : undefined;
        if (!last.current.since) last.current.since = new Date().toISOString();
      } catch {
        // ignora erros para manter UX fluída
      }
    }

    tick();
    const id = window.setInterval(tick, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [loading, user?.role, user?.id]);

  const dismiss = (id: string) => setAlerts(list => list.filter(a => a.id !== id));

  return { alerts, dismiss };
}
