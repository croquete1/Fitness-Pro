"use client";

import Link from "next/link";
import { usePoll } from "@/hooks/usePoll";

const Card = (props: { href: string; title: string; desc?: string; icon: React.ReactNode; kpi?: string | number }) => (
  <Link href={props.href} className="card" style={{
    padding: 16, borderRadius: 16, display:"grid", gap:8, border:"1px solid var(--border)",
    transition:"transform .05s ease, box-shadow .15s ease"
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      {props.icon}
      <div style={{ fontWeight:800 }}>{props.title}</div>
      {props.kpi !== undefined && <span className="badge" style={{ marginLeft:"auto" }}>{props.kpi}</span>}
    </div>
    {props.desc && <div className="text-muted" style={{ fontSize:13 }}>{props.desc}</div>}
  </Link>
);

export default function AdminHub() {
  const { data: approvals } = usePoll<{pending:number, active:number, suspended:number}>("/api/admin/approvals/count", { intervalMs: 30000 });
  const { data: notifs } = usePoll<any[]>("/api/admin/notifications?limit=8", { intervalMs: 45000 });

  return (
    <div style={{ padding: 16, display:"grid", gap:16 }}>
      <h1 style={{ margin:0 }}>Administração</h1>
      <div style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Card href="/dashboard/admin/approvals" title="Aprovações" kpi={approvals?.pending ?? "—"}
              icon={<span className="badge-success">✅</span>} desc="Pedidos de conta pendentes."/>
        <Card href="/dashboard/admin/users" title="Utilizadores" icon={<span className="badge">🧑‍💼</span>}
              desc="Gestão de contas e perfis."/>
        <Card href="/dashboard/admin/exercises" title="Exercícios" icon={<span className="badge">🏋️</span>}
              desc="Base de exercícios."/>
        <Card href="/dashboard/admin/plans" title="Planos (Admin)" icon={<span className="badge">🗂️</span>}
              desc="Templates e planos globais."/>
        <Card href="/dashboard/admin/schedule" title="Escala/Equipa" icon={<span className="badge">👥</span>}
              desc="Atribuições e turnos."/>
        <Card href="/dashboard/system/health" title="Sistema" icon={<span className="badge">🖥️</span>}
              desc="Estado do sistema."/>
        <Card href="/dashboard/system/logs" title="Logs" icon={<span className="badge-danger">🧾</span>}
              kpi={Array.isArray(notifs) ? notifs.length : "—"} desc="Auditoria e eventos."/>
      </div>
    </div>
  );
}
