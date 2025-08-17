"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usePoll } from "@/hooks/usePoll";

/* ---------- Icones com “chip” colorido ---------- */
function ChipIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: color,
        color: "#fff",
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}
const IHome       = () => <ChipIcon color="#6b5cff">🏠</ChipIcon>;
const ISessions   = () => <ChipIcon color="#2e9bff">📅</ChipIcon>;
const IMessages   = () => <ChipIcon color="#ff6b9e">💬</ChipIcon>;
const IProfile    = () => <ChipIcon color="#38c793">👤</ChipIcon>;
const IReports    = () => <ChipIcon color="#ffa53b">📈</ChipIcon>;
const ISettings   = () => <ChipIcon color="#9aa0a6">⚙️</ChipIcon>;
const IAdmin      = () => <ChipIcon color="#6b5cff">🛡️</ChipIcon>;
const IApprove    = () => <ChipIcon color="#22c55e">✅</ChipIcon>;
const IExercise   = () => <ChipIcon color="#f59e0b">🏋️</ChipIcon>;
const IPlans      = () => <ChipIcon color="#06b6d4">🗂️</ChipIcon>;
const ITeam       = () => <ChipIcon color="#a855f7">👥</ChipIcon>;
const IUsers      = () => <ChipIcon color="#0ea5e9">🧑‍💼</ChipIcon>;
const ISystem     = () => <ChipIcon color="#94a3b8">🖥️</ChipIcon>;
const ILogs       = () => <ChipIcon color="#ef4444">🧾</ChipIcon>;
const ILibrary    = () => <ChipIcon color="#0ea5e9">📚</ChipIcon>;
const IChevron = ({ open }: { open: boolean }) => (
  <span aria-hidden style={{ transition: "transform .2s", transform: `rotate(${open ? 90 : 0}deg)` }}>▸</span>
);

/* ---------- UI: badge ---------- */
function CountBadge({ value }: { value: number }) {
  if (!value || value <= 0) return null;
  return (
    <span
      aria-label={`${value} itens`}
      style={{
        marginLeft: "auto",
        fontSize: 11,
        fontWeight: 800,
        padding: "2px 6px",
        borderRadius: 999,
        background: "var(--brand, #6b5cff)",
        color: "#fff",
      }}
    >
      {value}
    </span>
  );
}

/* ---------- Tipos ---------- */
type SidebarProps = { open: boolean; onClose: () => void; onToggle: () => void; };
type NavLink = { label: string; href: string; icon: React.ReactNode; badge?: number };
type NavGroup = { id: string; label: string; icon: React.ReactNode; items: NavLink[] };

/* ---------- Componente ---------- */
export default function Sidebar({ open, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname() ?? "";

  /* --- POLLING dos contadores --- */
  // Aprovações (admin)
  const approvalsPoll = usePoll<{ pending: number; active: number; suspended: number }>(
    "/api/admin/approvals/count",
    { intervalMs: 30000, immediate: true }
  );
  const approvalsPending = approvalsPoll.data?.pending ?? 0;

  // Notificações -> usamos o tamanho da lista
  const notifPoll = usePoll<any[]>("/api/admin/notifications?limit=8", { intervalMs: 45000, immediate: true });
  const notifCount = Array.isArray(notifPoll.data) ? notifPoll.data.length : 0;

  // Sessões próximas (do stats)
  const statsPoll = usePoll<{ sessionsUpcoming?: number }>("/api/dashboard/stats", {
    intervalMs: 60000,
    immediate: true,
  });
  const sessionsNext = statsPoll.data?.sessionsUpcoming ?? 0;

  /* Links principais */
  const mainLinks: NavLink[] = useMemo(() => ([
    { label: "Início",     href: "/dashboard",          icon: <IHome /> },
    { label: "Sessões",    href: "/dashboard/sessions", icon: <ISessions />, badge: sessionsNext },
    { label: "Mensagens",  href: "/dashboard/messages", icon: <IMessages />, badge: notifCount },
    { label: "Perfil",     href: "/dashboard/profile",  icon: <IProfile /> },
    { label: "Relatórios", href: "/dashboard/reports",  icon: <IReports /> },
    { label: "Definições", href: "/dashboard/settings", icon: <ISettings /> },
  ]), [sessionsNext, notifCount]);

  /* Grupos com subcategorias */
  const grpAdmin: NavGroup = useMemo(() => ({
    id: "grp-admin",
    label: "Administração",
    icon: <IAdmin />,
    items: [
      { label: "Administração", href: "/dashboard/admin",           icon: <IAdmin /> },
      { label: "Aprovações",    href: "/dashboard/admin/approvals", icon: <IApprove />, badge: approvalsPending },
      { label: "Exercícios",    href: "/dashboard/admin/exercises", icon: <IExercise /> },
      { label: "Planos (Admin)",href: "/dashboard/admin/plans",     icon: <IPlans /> },
      { label: "Escala/Equipa", href: "/dashboard/admin/schedule",  icon: <ITeam /> },
      { label: "Utilizadores",  href: "/dashboard/admin/users",     icon: <IUsers /> },
    ],
  // approvalsPending no deps para atualizar o badge
  }), [approvalsPending]);

  const grpPT: NavGroup = useMemo(() => ({
    id: "grp-pt",
    label: "PT",
    icon: <ITeam />,
    items: [
      { label: "Clientes",  href: "/dashboard/pt-clientes", icon: <IUsers /> },
      { label: "Biblioteca",href: "/dashboard/pt/library",  icon: <ILibrary /> },
      { label: "Planos",    href: "/dashboard/pt/plans",    icon: <IPlans /> },
    ],
  }), []);

  const grpSystem: NavGroup = useMemo(() => ({
    id: "grp-system",
    label: "Sistema",
    icon: <ISystem />,
    items: [
      { label: "Sistema", href: "/dashboard/system/health", icon: <ISystem /> },
      { label: "Logs",    href: "/dashboard/system/logs",   icon: <ILogs /> },
    ],
  }), []);

  /* Estado aberto/fechado por grupo (persistido) */
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sidebar:groups");
      if (raw) setOpenGroups(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("sidebar:groups", JSON.stringify(openGroups)); } catch {}
  }, [openGroups]);

  /* Abrir automaticamente o grupo da rota ativa */
  useEffect(() => {
    const g = { ...openGroups };
    [grpAdmin, grpPT, grpSystem].forEach(grp => {
      if (grp.items.some(it => pathname === it.href || pathname.startsWith(it.href + "/"))) g[grp.id] = true;
    });
    setOpenGroups(prev => ({ ...prev, ...g }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (id: string) => setOpenGroups(s => ({ ...s, [id]: !s[id] }));

  /* Estilos base/ativo para reusar */
  const baseItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "var(--fg)",
  };
  const activeItem: React.CSSProperties = {
    background: "var(--selection, rgba(0,0,0,.06))",
    color: "var(--brand, #6b5cff)",
    fontWeight: 700,
  };

  /* Backdrop mobile */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const compute = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 1024);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  const showBackdrop = open && isMobile;

  return (
    <>
      {showBackdrop && (
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.28)",
            border: "none",
            padding: 0,
            margin: 0,
            zIndex: 30,
          }}
        />
      )}

      <aside
        aria-label="Sidebar de navegação"
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          zIndex: 31,
          width: open ? 280 : 76,
          transition: "width .2s",
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          minHeight: "100dvh",
          padding: 12,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 12,
        }}
      >
        {/* topo: botão menu + título + toggle de tema */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              className="pill"
              onClick={onToggle}
              aria-label="Alternar menu"
              style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
            >
              ☰
            </button>
            {open && <strong style={{ fontSize: 16 }}>Menu</strong>}
          </div>
          {open && <ThemeToggle />}
        </div>

        {/* navegação */}
        <nav style={{ display: "grid", gap: 8 }}>
          {/* principais */}
          {open && <SectionLabel text="Início" />}
          {mainLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav-item"
                style={{ ...baseItem, justifyContent: "space-between", ...(active ? activeItem : null) }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {l.icon}
                  {open && <span>{l.label}</span>}
                </span>
                {open && !!l.badge && <CountBadge value={l.badge} />}
              </Link>
            );
          })}

          {/* Administração */}
          <Group
            open={!!openGroups[grpAdmin.id]}
            canShowText={open}
            group={grpAdmin}
            pathname={pathname}
            onToggle={() => toggleGroup(grpAdmin.id)}
            baseItemStyle={baseItem}
            activeItemStyle={activeItem}
          />

          {/* PT */}
          <Group
            open={!!openGroups[grpPT.id]}
            canShowText={open}
            group={grpPT}
            pathname={pathname}
            onToggle={() => toggleGroup(grpPT.id)}
            baseItemStyle={baseItem}
            activeItemStyle={activeItem}
          />

          {/* Sistema */}
          <Group
            open={!!openGroups[grpSystem.id]}
            canShowText={open}
            group={grpSystem}
            pathname={pathname}
            onToggle={() => toggleGroup(grpSystem.id)}
            baseItemStyle={baseItem}
            activeItemStyle={activeItem}
          />
        </nav>

        {/* fundo: sessão / signout */}
        <div style={{ display: "grid", gap: 8 }}>
          {open && <div className="text-muted" style={{ fontSize: 12 }}>* Sessão iniciada</div>}
          <button
            type="button"
            className="pill"
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ padding: "10px 12px" }}
          >
            Terminar sessão
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------- Secções & Grupos ---------- */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="text-muted" style={{ fontSize: 11, fontWeight: 700, padding: "6px 12px" }}>
      {text}
    </div>
  );
}

function Group(props: {
  open: boolean;
  canShowText: boolean;
  group: NavGroup;
  pathname: string;
  onToggle: () => void;
  baseItemStyle: React.CSSProperties;
  activeItemStyle: React.CSSProperties;
}) {
  const { open, canShowText, group, pathname, onToggle, baseItemStyle, activeItemStyle } = props;
  const anyActive = group.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"));

  return (
    <div>
      {canShowText && <SectionLabel text={group.label} />}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="nav-group-trigger"
        style={{
          ...baseItemStyle,
          width: "100%",
          border: "1px solid var(--border)",
          background: "transparent",
          justifyContent: "space-between",
          ...(anyActive ? activeItemStyle : null),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {group.icon}
          {canShowText && <span>{group.label}</span>}
        </div>
        {canShowText && <IChevron open={open} />}
      </button>

      <div
        hidden={!open}
        style={{
          display: open ? "grid" : "none",
          gap: 6,
          paddingLeft: canShowText ? 28 : 0,
          marginTop: 6,
        }}
      >
        {group.items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-subitem"
              style={{ ...baseItemStyle, justifyContent: "space-between", ...(active ? activeItemStyle : null) }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.icon}
                {canShowText && <span>{item.label}</span>}
              </span>
              {canShowText && !!item.badge && <CountBadge value={item.badge} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
