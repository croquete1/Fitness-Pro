"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MenuGroup from "./MenuGroup";

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

export default function Menu({
  data,
  role,
}: {
  data: Entry[];
  role?: Role;
}) {
  const pathname = usePathname();

  return (
    <nav className="fp-nav" aria-label="Principal">
      {data.map((e, idx) =>
        (e as any).kind === "group" ? (
          <MenuGroup
            key={idx}
            group={e as Group}
            pathname={pathname}
            role={role} // <- continua a descer a role
          />
        ) : (
          <a
            key={(e as Item).href}
            href={(e as Item).href}
            className="nav-item"
            data-active={
              (e as Item).activeExact
                ? pathname === (e as Item).href
                : pathname.startsWith((e as Item).href)
                ? "true"
                : "false"
            }
          >
            <span className="nav-icon">{(e as Item).icon}</span>
            <span className="nav-label">{(e as Item).label}</span>
          </a>
        )
      )}
    </nav>
  );
}
