"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { useSidebar } from "@/components/SidebarWrapper";
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from "lucide-react";
import "./sidebar.css";

export type Item = { href: string; label: string; icon: React.ReactNode; exact?: boolean };
export type Group = { title: string; items: Item[] };
export type SidebarBaseProps = { nav: Group[] };

function normalize(p: string) {
  return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
}
function isActive(pathname: string, href: string, exact?: boolean) {
  const clean = normalize(pathname);
  if (exact || href === "/dashboard") return clean === href;
  return clean === href || clean.startsWith(href + "/");
}

export default function SidebarBase({ nav }: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // “peek” só quando está colapsada e não afixada
  const [peek, setPeek] = React.useState(false);
  const timer = React.useRef<number | null>(null);
  const onEnter = () => {
    if (!(collapsed && !pinned)) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPeek(true), 250);
  };
  const onLeave = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setPeek(false);
  };
  React.useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const [hasLogo, setHasLogo] = React.useState(true);

  return (
    <div
      className={`fp-sb-flyout${peek ? " is-peek" : ""}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      role="navigation"
      aria-label="Navegação lateral"
    >
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Ir para a Dashboard">
          <span className={`brand-logo${hasLogo ? " has-img" : ""}`}>
            {hasLogo ? (
              <Image
                src="/logo.png"
                alt="Fitness Pro"
                width={28}
                height={28}
                priority
                onError={() => setHasLogo(false)}
              />
            ) : (
              <span className="brand-emoji" aria-hidden>📊</span>
            )}
          </span>
          <span className="brand-text">
            <strong className="brand-name">Fitness&nbsp;Pro</strong>
            <span className="brand-sub">Dashboard</span>
          </span>
        </Link>

        <div className="fp-sb-actions">
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            title={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            onClick={togglePinned}
            data-role="sb-pin"
          >
            {pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? "Expandir menu" : "Encolher para ícones"}
            title={collapsed ? "Expandir menu" : "Encolher para ícones"}
            onClick={toggleCollapsed}
            data-role="sb-toggle"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </div>

      <nav className="fp-nav">
        {nav.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-section">{group.title}</div>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item"
                  data-active={active ? "true" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
