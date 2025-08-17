"use client";

import React from "react";
import Link from "next/link";

/**
 * Se já tens estes tipos noutro ficheiro, podes trocar 'any' por esses tipos.
 * Usei 'any' aqui para não criar conflitos com o teu modelo atual.
 */
type Role = any;

type MenuItem = {
  kind: "item";
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  activeExact?: boolean;
};

type MenuGroupT = {
  kind: "group";
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  items: MenuItem[];
};

type Props = {
  group: MenuGroupT;
  pathname: string;
  role?: Role; // <- ADICIONADA
};

export default function MenuGroup({ group, pathname, role }: Props) {
  // Se o grupo tiver restrição de roles, filtra pela role do utilizador
  const groupVisible = !group.roles || (role && group.roles.includes(role));
  if (!groupVisible) return null;

  const items = (group.items || []).filter(
    (it) => !it.roles || (role && it.roles.includes(role))
  );

  return (
    <div className="nav-group">
      <div className="nav-group-trigger" role="button" tabIndex={0} aria-label={group.label}>
        <span className="nav-icon">{group.icon}</span>
        <span className="nav-label">{group.label}</span>
        <span className="nav-caret">▾</span>
      </div>

      <div className="nav-sublist">
        {items.map((it) => {
          const active = it.activeExact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className="nav-subitem"
              data-active={active ? "true" : "false"}
            >
              <span className="nav-icon">{it.icon}</span>
              <span className="nav-label">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
