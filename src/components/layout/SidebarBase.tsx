"use client";

import Link from "next/link";
import Image from "next/image";
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
export type Group = { title: string; items: Item[] };
export type SidebarBaseProps = { nav: Group[]; showToggle?: boolean };

function normalize(p: string) {
  return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
}
function isActive(pathname: string, href: string, exact?: boolean) {
  const clean = normalize(pathname);
  if (exact) return clean === href;
  return clean === href || clean.startsWith(href + "/");
}

export default function SidebarBase({ nav, showToggle = true }: SidebarBaseProps) {
  const pathname = usePathname();

  // Hover-peek sem flicker (controlado via classe)
  const [peek, setPeek] = React.useState(false);
  const t = React.useRef<number | null>(null);
  const inside = React.useRef(false);

  const onEnter = () => {
    inside.current = true;
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => inside.current && setPeek(true), 250);
  };
  const onLeave = () => {
    inside.current = false;
    if (t.current) window.clearTimeout(t.current);
    setPeek(false);
  };
  React.useEffect(() => () => { if (t.current) window.clearTimeout(t.current); }, []);

  const [hasLogo, setHasLogo] = React.useState(true);

  return (
    <div
      className={`fp-sb-flyout${peek ? " is-peek" : ""}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      role="navigation"
      aria-label="Navegação lateral"
    >
      <nav className="fp-nav">
        {/* Header da sidebar */}
        <div className="sb-header">
          <Link href="/dashboard" className="nav-brand" aria-label="Ir para a Dashboard">
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
              <span className="brand-name">Fitness&nbsp;Pro</span>
              <span className="brand-sub">Dashboard</span>
            </span>
          </Link>

          {showToggle && (
            <button className="sb-pin" aria-label="Afixar/Desafixar sidebar">
              <SbToggle />
            </button>
          )}
        </div>

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
