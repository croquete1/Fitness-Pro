"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usePoll } from "@/hooks/usePoll";
import { useMe } from "@/hooks/useMe";

/* ---- Ícones como chips ---- */
function ChipIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span aria-hidden style={{
      width: 22, height: 22, borderRadius: 8, display: "grid", placeItems: "center",
      background: color, color: "#fff", fontSize: 12, lineHeight: 1
    }}>{children}</span>
  );
}
const IHome=()=> <ChipIcon color="#6b5cff">🏠</ChipIcon>;
const ISessions=()=> <ChipIcon color="#2e9bff">📅</ChipIcon>;
const IMessages=()=> <ChipIcon color="#ff6b9e">💬</ChipIcon>;
const IProfile=()=> <ChipIcon color="#38c793">👤</ChipIcon>;
const IReports=()=> <ChipIcon color="#ffa53b">📈</ChipIcon>;
const ISettings=()=> <ChipIcon color="#9aa0a6">⚙️</ChipIcon>;
const IAdmin=()=> <ChipIcon color="#6b5cff">🛡️</ChipIcon>;
const IApprove=()=> <ChipIcon color="#22c55e">✅</ChipIcon>;
const IExercise=()=> <ChipIcon color="#f59e0b">🏋️</ChipIcon>;
const IPlans=()=> <ChipIcon color="#06b6d4">🗂️</ChipIcon>;
const ITeam=()=> <ChipIcon color="#a855f7">👥</ChipIcon>;
const IUsers=()=> <ChipIcon color="#0ea5e9">🧑‍💼</ChipIcon>;
const ISystem=()=> <ChipIcon color="#94a3b8">🖥️</ChipIcon>;
const ILogs=()=> <ChipIcon color="#ef4444">🧾</ChipIcon>;
const ILibrary=()=> <ChipIcon color="#0ea5e9">📚</ChipIcon>;
const IChevron=({open}:{open:boolean})=>(
  <span aria-hidden style={{transition:"transform .2s", transform:`rotate(${open?90:0}deg)`}}>▸</span>
);

/* ---- Helpers ---- */
function isActive(path: string, href: string, opts?: { strict?: boolean }) {
  const strict = opts?.strict ?? false;
  if (strict) return path === href;
  return path === href || path.startsWith(href + "/");
}

type SidebarProps = { open: boolean; onClose: () => void; onToggle: () => void; };
type NavLink = { label: string; href: string; icon: React.ReactNode; badge?: number; strictBase?: boolean };
type NavGroup = { id: string; label: string; icon: React.ReactNode; items: NavLink[] };

export default function Sidebar({ open, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const { user } = useMe();
  const role = (user?.role ?? "ADMIN").toUpperCase();

  /* ---- Polling para badges ---- */
  const { data: approvals } = usePoll<{pending:number}>("/api/admin/approvals/count", { intervalMs: 30000 });
  const pending = approvals?.pending ?? 0;
  const { data: notifs } = usePoll<any[]>("/api/admin/notifications?limit=8", { intervalMs: 45000 });
  const notifCount = Array.isArray(notifs) ? notifs.length : 0;
  const { data: stats } = usePoll<{sessionsUpcoming?:number}>("/api/dashboard/stats", { intervalMs: 60000 });
  const sessionsNext = stats?.sessionsUpcoming ?? 0;

  /* ---- Links principais ---- */
  const mainLinks: NavLink[] = useMemo(() => ([
    { label: "Início",     href: "/dashboard",          icon: <IHome />,     strictBase: true },
    { label: "Sessões",    href: "/dashboard/sessions", icon: <ISessions />, badge: sessionsNext },
    { label: "Mensagens",  href: "/dashboard/messages", icon: <IMessages />, badge: notifCount  },
    { label: "Perfil",     href: "/dashboard/profile",  icon: <IProfile /> },
    { label: "Relatórios", href: "/dashboard/reports",  icon: <IReports /> },
    { label: "Definições", href: "/dashboard/settings", icon: <ISettings /> },
  ]), [sessionsNext, notifCount]);

  /* ---- Grupos ---- */
  const grpAdmin: NavGroup = {
    id: "grp-admin", label: "Administração", icon: <IAdmin />,
    items: [
      { label: "Administração", href: "/dashboard/admin",           icon: <IAdmin />,   strictBase: true },
      { label: "Aprovações",    href: "/dashboard/admin/approvals", icon: <IApprove />, badge: pending },
      { label: "Exercícios",    href: "/dashboard/admin/exercises", icon: <IExercise /> },
      { label: "Planos (Admin)",href: "/dashboard/admin/plans",     icon: <IPlans /> },
      { label: "Escala/Equipa", href: "/dashboard/admin/schedule",  icon: <ITeam /> },
      { label: "Utilizadores",  href: "/dashboard/admin/users",     icon: <IUsers /> },
    ],
  };

  const grpPT: NavGroup = {
    id: "grp-pt", label: "PT", icon: <ITeam />,
    items: [
      { label: "Clientes",   href: "/dashboard/pt-clientes", icon: <IUsers /> },
      { label: "Biblioteca", href: "/dashboard/pt/library",  icon: <ILibrary /> },
      { label: "Planos",     href: "/dashboard/pt/plans",    icon: <IPlans /> },
    ],
  };

  const grpSystem: NavGroup = {
    id: "grp-system", label: "Sistema", icon: <ISystem />,
    items: [
      { label: "Sistema", href: "/dashboard/system/health", icon: <ISystem />, strictBase: true },
      { label: "Logs",    href: "/dashboard/system/logs",   icon: <ILogs /> },
    ],
  };

  // Role-aware: ADMIN vê tudo; TRAINER vê PT + principais; CLIENT apenas principais
  const groups: NavGroup[] = useMemo(() => {
    if (role === "ADMIN") return [grpAdmin, grpPT, grpSystem];
    if (role === "TRAINER") return [grpPT];
    return []; // CLIENT sem grupos
  }, [role, pending]);

  /* ---- Estado/persistência de grupos ---- */
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  useEffect(() => { try { const raw = localStorage.getItem("sidebar:groups"); if (raw) setOpenGroups(JSON.parse(raw)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("sidebar:groups", JSON.stringify(openGroups)); } catch {} }, [openGroups]);

  useEffect(() => {
    const g = { ...openGroups };
    groups.forEach(grp => {
      if (grp.items.some(it => isActive(pathname, it.href, { strict: !!it.strictBase }))) g[grp.id] = true;
    });
    setOpenGroups(prev => ({ ...prev, ...g }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, role]);

  const toggleGroup = (id: string) => setOpenGroups(s => ({ ...s, [id]: !s[id] }));

  /* ---- Estilos ---- */
  const baseItem: React.CSSProperties = { display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
    borderRadius:12, textDecoration:"none", color:"var(--fg)" };
  const activeItem: React.CSSProperties = { background:"var(--selection)", color:"var(--brand)", fontWeight:700 };

  /* ---- Backdrop mobile (opcional) ---- */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const c=()=>setIsMobile(typeof window!=="undefined" && window.innerWidth<1024); c(); window.addEventListener("resize", c); return ()=>window.removeEventListener("resize", c); }, []);
  const showBackdrop = open && isMobile;

  return (
    <>
      {showBackdrop && (
        <button onClick={onClose} aria-label="Fechar menu" style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.28)", border:"none", padding:0, margin:0, zIndex:30 }} />
      )}

      <aside className={`fp-sidebar ${open ? "" : "is-collapsed"}`} aria-label="Sidebar de navegação">
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button type="button" className="pill" onClick={onToggle} aria-label="Alternar menu"
              style={{ width:36, height:36, display:"grid", placeItems:"center" }}>☰</button>
            {open && <strong style={{ fontSize:16 }}>Menu</strong>}
          </div>
          {open && <ThemeToggle />}
        </div>

        <nav>
          {open && <div className="text-muted" style={{ fontSize:11, fontWeight:700, padding:"6px 12px" }}>Início</div>}
          {mainLinks.map(l => {
            const active = isActive(pathname, l.href, { strict: !!l.strictBase });
            return (
              <Link key={l.href} href={l.href}
                className="nav-item"
                style={{ ...baseItem, justifyContent:"space-between", ...(active ? activeItem : null) }}>
                <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {l.icon}
                  {open && <span>{l.label}</span>}
                </span>
                {open && l.badge ? (
                  <span style={{ marginLeft:"auto", fontSize:11, fontWeight:800, padding:"2px 6px",
                    borderRadius:999, background:"var(--brand)", color:"#fff" }}>{l.badge}</span>
                ) : null}
              </Link>
            );
          })}

          {groups.map(grp => {
            const anyActive = grp.items.some(it => isActive(pathname, it.href, { strict: !!it.strictBase }));
            const openState = !!openGroups[grp.id];
            return (
              <div key={grp.id}>
                {open && <div className="text-muted" style={{ fontSize:11, fontWeight:700, padding:"6px 12px" }}>{grp.label}</div>}
                <button type="button" onClick={() => toggleGroup(grp.id)} aria-expanded={openState} className="nav-group-trigger"
                  style={{ ...baseItem, justifyContent:"space-between", border:"1px solid var(--border)", ...(anyActive ? activeItem : null) }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>{grp.icon}{open && <span>{grp.label}</span>}</div>
                  {open && <IChevron open={openState} />}
                </button>
                <div hidden={!openState} style={{ display: openState ? "grid" : "none", gap:6, paddingLeft: open ? 28 : 0, marginTop:6 }}>
                  {grp.items.map(item => {
                    const active = isActive(pathname, item.href, { strict: !!item.strictBase });
                    return (
                      <Link key={item.href} href={item.href} className="nav-subitem"
                        style={{ ...baseItem, justifyContent:"space-between", ...(active ? activeItem : null) }}>
                        <span style={{ display:"flex", alignItems:"center", gap:10 }}>{item.icon}{open && <span>{item.label}</span>}</span>
                        {"badge" in item && (item as any).badge ? (
                          <span style={{ marginLeft:"auto", fontSize:11, fontWeight:800, padding:"2px 6px",
                            borderRadius:999, background:"var(--brand)", color:"#fff" }}>{(item as any).badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ display:"grid", gap:8, marginTop:12 }}>
          {open && <div className="text-muted" style={{ fontSize:12 }}>* Sessão iniciada</div>}
          <button type="button" className="pill" onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ padding:"10px 12px" }}>Terminar sessão</button>
        </div>
      </aside>
    </>
  );
}
