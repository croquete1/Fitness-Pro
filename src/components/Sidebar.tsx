"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

type NavLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type NavGroup = {
  label: string;
  icon?: React.ReactNode;
  id: string; // para persistir estado aberto/fechado
  items: NavLink[];
};

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" fill="currentColor" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5l-8-3Z" fill="currentColor" />
    </svg>
  );
}
function IconSystem() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 8a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 8Zm10 3h-2.09a7.96 7.96 0 0 0-1.1-2.64l1.48-1.48-1.41-1.41-1.48 1.48A7.96 7.96 0 0 0 13 4.09V2h-2v2.09a7.96 7.96 0 0 0-2.64 1.1L6.88 3.71 5.47 5.12l1.48 1.48A7.96 7.96 0 0 0 4.09 11H2v2h2.09a7.96 7.96 0 0 0 1.1 2.64l-1.48 1.48 1.41 1.41 1.48-1.48A7.96 7.96 0 0 0 11 19.91V22h2v-2.09a7.96 7.96 0 0 0 2.64-1.1l1.48 1.48 1.41-1.41-1.48-1.48A7.96 7.96 0 0 0 21.91 13H24v-2h-2Z" fill="currentColor"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v3h10v-3c0-1.52.66-2.78 1.71-3.77A9.59 9.59 0 0 0 8 14Zm8 0c-1.48 0-2.84.3-4 .82A5 5 0 0 1 18 19v3h6v-3c0-3.33-4.67-5-8-5Z" fill="currentColor"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Zm2 2v12h10V6H6Zm14 0h2v14h-2V6Z" fill="currentColor" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M9 2h6v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm0 6v2h6V8H9Zm0 4v2h6v-2H9Z" fill="currentColor" />
    </svg>
  );
}
function IconChevron({open}:{open:boolean}) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{transform:`rotate(${open?90:0}deg)`, transition:"transform .2s"}}>
      <path d="M9 18l6-6-6-6" fill="currentColor"/>
    </svg>
  );
}

export default function Sidebar({ open, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();

  // NAV DATA — mantém as rotas que já tens no projeto
  const home: NavLink = useMemo(() => ({
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconHome/>
  }), []);

  const adminGroup: NavGroup = useMemo(() => ({
    id: "grp-admin",
    label: "Administração",
    icon: <IconShield/>,
    items: [
      { label: "Aprovações", href: "/dashboard/admin", icon: <IconShield/> },
      { label: "Sistema", href: "/dashboard/system/health", icon: <IconSystem/> },
    ],
  }), []);

  const ptGroup: NavGroup = useMemo(() => ({
    id: "grp-pt",
    label: "PT",
    icon: <IconUsers/>,
    items: [
      { label: "Clientes", href: "/dashboard/pt-clientes", icon: <IconUsers/> },
      { label: "Biblioteca", href: "/dashboard/pt/library", icon: <IconBook/> },
      { label: "Planos", href: "/dashboard/pt/plans", icon: <IconClipboard/> },
    ],
  }), []);

  // estado de grupos (persistido)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sidebar:groups");
      if (raw) setOpenGroups(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("sidebar:groups", JSON.stringify(openGroups));
    } catch {}
  }, [openGroups]);

  // abre automaticamente o grupo correspondente à rota ativa
  useEffect(() => {
    const upd: Record<string, boolean> = { ...openGroups };
    [adminGroup, ptGroup].forEach(g => {
      if (g.items.some(it => pathname?.startsWith(it.href))) upd[g.id] = true;
    });
    setOpenGroups(prev => ({ ...prev, ...upd }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (id: string) =>
    setOpenGroups(s => ({ ...s, [id]: !s[id] }));

  // helpers de estilo
  const baseItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "var(--fg)",
  };
  const activeItemStyle: React.CSSProperties = {
    background: "var(--selection, rgba(0,0,0,.06))",
    color: "var(--brand, #6b5cff)",
    fontWeight: 700,
  };

  // BACKDROP mobile
  const showBackdrop = open && typeof window !== "undefined" && window.innerWidth < 1024;

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
          width: open ? 270 : 72,
          transition: "width .2s",
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          minHeight: "100dvh",
          padding: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
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

        {/* NAV */}
        <nav style={{ display: "grid", gap: 6 }}>
          {/* Home */}
          <Link
            href={home.href}
            className="nav-item"
            style={{
              ...baseItemStyle,
              ...(pathname?.startsWith(home.href) ? activeItemStyle : null),
            }}
          >
            <span style={{ width: 18, display: "grid", placeItems: "center" }}>{home.icon}</span>
            {open && <span>{home.label}</span>}
          </Link>

          {/* Admin group */}
          <Group
            open={!!openGroups[adminGroup.id]}
            canShowText={open}
            group={adminGroup}
            pathname={pathname ?? ""}
            onToggle={() => toggleGroup(adminGroup.id)}
            baseItemStyle={baseItemStyle}
            activeItemStyle={activeItemStyle}
          />

          {/* PT group */}
          <Group
            open={!!openGroups[ptGroup.id]}
            canShowText={open}
            group={ptGroup}
            pathname={pathname ?? ""}
            onToggle={() => toggleGroup(ptGroup.id)}
            baseItemStyle={baseItemStyle}
            activeItemStyle={activeItemStyle}
          />

          {/* Botão fechar (mobile) */}
          {open && (
            <button
              type="button"
              className="pill"
              onClick={onClose}
              style={{ marginTop: 8, padding: "10px 12px" }}
            >
              Fechar
            </button>
          )}
        </nav>
      </aside>
    </>
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
  const anyActive = group.items.some(it => pathname.startsWith(it.href));

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="nav-group-trigger"
        style={{
          ...baseItemStyle,
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          ...(anyActive ? activeItemStyle : null),
        }}
      >
        <span style={{ width: 18, display: "grid", placeItems: "center" }}>{group.icon}</span>
        {canShowText && (
          <>
            <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
            <IconChevron open={open}/>
          </>
        )}
      </button>

      <div
        hidden={!open}
        style={{
          display: open ? "grid" : "none",
          gap: 4,
          paddingLeft: canShowText ? 30 : 0,
          marginTop: 4,
        }}
      >
        {group.items.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-subitem"
              style={{
                ...baseItemStyle,
                padding: "8px 12px",
                ...(active ? activeItemStyle : null),
              }}
            >
              <span style={{ width: 18, display: "grid", placeItems: "center" }}>{item.icon}</span>
              {canShowText && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
