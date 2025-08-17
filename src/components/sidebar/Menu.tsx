"use client";

import React from "react";
import { usePathname } from "next/navigation";

type Role = any;
type Item = {
  kind: "item";
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  activeExact?: boolean;
};
type Group = {
  kind: "group";
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  items: Item[];
};
type Entry = Item | Group;

export default function Menu({ data, role }: { data: Entry[]; role?: Role }) {
  const pathname = usePathname();
  const allowed = (roles?: Role[]) =>
    !roles || roles.length === 0 || (role != null && roles.includes(role));

  return (
    <nav className="fp-nav" aria-label="Principal">
      {data.map((entry, idx) => {
        if ((entry as any).kind === "group") {
          const g = entry as Group;
          if (!allowed(g.roles)) return null;

          return (
            <React.Fragment key={`g-${idx}`}>
              <div className="nav-section">{g.label}</div>
              {g.items.map((it, k) => {
                if (!allowed(it.roles)) return null;
                const active = it.activeExact
                  ? pathname === it.href
                  : pathname.startsWith(it.href);

                return (
                  <a
                    key={`${g.label}-${k}`}
                    href={it.href}
                    className="nav-item"
                    data-active={active ? "true" : "false"}
                  >
                    <span className="nav-icon">{it.icon}</span>
                    <span className="nav-label">{it.label}</span>
                  </a>
                );
              })}
            </React.Fragment>
          );
        }

        const it = entry as Item;
        if (!allowed(it.roles)) return null;
        const active = it.activeExact
          ? pathname === it.href
          : pathname.startsWith(it.href);

        return (
          <a
            key={`i-${idx}`}
            href={it.href}
            className="nav-item"
            data-active={active ? "true" : "false"}
          >
            <span className="nav-icon">{it.icon}</span>
            <span className="nav-label">{it.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
