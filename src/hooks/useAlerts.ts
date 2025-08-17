"use client";

import { useEffect, useRef, useState } from "react";
import { useMe } from "./useMe";

type Alert = { id: string; title: string; body?: string; when?: number };

export function useAlerts() {
  const { user } = useMe();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const last = useRef<{ approvals?: number; notifs?: number; since?: string }>({});

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        // 1) contagens que já existiam
        const [a, n] = await Promise.all([
          fetch("/api/admin/approvals/count").then(r=>r.ok?r.json():{pending:0}).catch(()=>({pending:0})),
          fetch("/api/admin/notifications?limit=8").then(r=>r.ok?r.json():[]).catch(()=>[]),
        ]);
        const approvals = Number(a?.pending ?? 0);
        const notifs = Array.isArray(n) ? n.length : 0;

        const add: Alert[] = [];
        if (last.current.approvals !== undefined && approvals > (last.current.approvals ?? 0)) {
          add.push({ id: "appr:"+Date.now(), title: "Novos registos pendentes", body: `Tens ${approvals} aprovação(ões) por analisar.` });
        }
        if (last.current.notifs !== undefined && notifs > (last.current.notifs ?? 0)) {
          add.push({ id: "noti:"+Date.now(), title: "Novas notificações", body: `Recebeste ${notifs} notificações recentes.` });
        }

        // 2) NOVO — feed de eventos (limitado ao PT quando aplicável)
        const since = last.current.since ?? new Date(Date.now() - 60 * 1000).toISOString();
        const trainerFilter = user?.role?.toUpperCase() === "TRAINER" ? `&trainerId=${encodeURIComponent(user?.id ?? "")}` : "";
        const ev = await fetch(`/api/events?since=${encodeURIComponent(since)}${trainerFilter}`).then(r=>r.ok?r.json():{data:[]}).catch(()=>({data:[]}));
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
                body: "Um cliente foi atribuído a um personal trainer.",
              });
            }
          }
        }

        if (alive && add.length) setAlerts(prev => [...prev, ...add]);
        last.current.approvals = approvals;
        last.current.notifs = notifs;
        if (!last.current.since) last.current.since = new Date().toISOString();
      } catch {}
    }

    tick();
    const id = window.setInterval(tick, 30000);
    return () => { alive = false; window.clearInterval(id); };
  }, [user?.role, user?.id]);

  const dismiss = (id: string) => setAlerts(list => list.filter(a => a.id !== id));

  return { alerts, dismiss };
}
