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

function normalize(pathname: string) {
  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
function isActive(pathname: string, href: string, exact?: boolean) {
  const clean = normalize(pathname);
  if (exact) return clean === href;
  return clean === href || clean.startsWith(href + "/");
}

export default function SidebarBase({ nav }: { nav: Group[] }) {
  const pathname = usePathname();

  return (
    // ⬇️ Este wrapper permite “peek on hover” mesmo com a coluna da grid estreita
    <div className="fp-sb-flyout">
      <nav className="fp-nav">
        <div className="nav-tools">
          <SbToggle />
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
