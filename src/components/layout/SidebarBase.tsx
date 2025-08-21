"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/SidebarWrapper";
import { ChevronsLeft, ChevronsRight, Pin, PinOff } from "lucide-react";
import "./sidebar.css";

export type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};
export type Group = { title: string; items: Item[] };
export type SidebarBaseProps = {
  nav: Group[];
  showToggle?: boolean;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  const clean =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (exact || href === "/dashboard") return clean === href;
  return clean === href || clean.startsWith(href + "/");
}

export default function SidebarBase({ nav, showToggle = true }: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <div className="fp-sb-flyout" data-collapsed={collapsed} data-pinned={pinned}>
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="logo" priority />
          <div className="brand-text">
            <strong className="brand-name">Fitness Pro</strong>
            <span className="brand-sub">Dashboard</span>
          </div>
        </Link>

        {showToggle && (
          <div className="fp-sb-actions">
            <button
              type="button"
              className="btn icon"
              title={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
              aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
              onClick={togglePinned}
            >
              {pinned ? <Pin size={18} /> : <PinOff size={18} />}
            </button>

            <button
              type="button"
              className="btn icon"
              title={collapsed ? "Expandir menu" : "Encolher para ícones"}
              aria-label={collapsed ? "Expandir menu" : "Encolher para ícones"}
              onClick={toggleCollapsed}
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
          </div>
        )}
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
