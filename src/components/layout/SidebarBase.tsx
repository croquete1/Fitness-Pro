"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import SbToggle from "@/components/layout/SbToggle";
import "./sidebar.css";

export type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

export type Group = {
  title: string;
  items: Item[];
};

export type SidebarBaseProps = {
  nav: Group[];
  /** Mostrar o botão de compactar/expandir. Default: true */
  showToggle?: boolean;
};

function normalize(pathname: string) {
  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
function isActive(pathname: string, href: string, exact?: boolean) {
  const clean = normalize(pathname);
  if (exact) return clean === href;
  return clean === href || clean.startsWith(href + "/");
}

export default function SidebarBase({ nav, showToggle = true }: SidebarBaseProps) {
  const pathname = usePathname();

  return (
    /* Wrapper permite “peek on hover” — o :hover é no próprio flyout
       (não no <aside>), para manter o hover mesmo quando o painel sai
       fora da coluna da grid. */
    <div className="fp-sb-flyout">
      <nav className="fp-nav">
        {/* BRAND / LOGO */}
        <Link href="/dashboard" className="nav-brand" aria-label="Ir para a Dashboard">
          <span className="brand-logo" aria-hidden>📊</span>
          <span className="brand-text">
            <span className="brand-name">Fitness&nbsp;Pro</span>
            <span className="brand-sub">Dashboard</span>
          </span>
        </Link>

        {showToggle && (
          <div className="nav-tools">
            <SbToggle />
          </div>
        )}

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
