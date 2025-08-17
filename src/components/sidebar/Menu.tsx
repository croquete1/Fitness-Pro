// src/components/sidebar/Menu.tsx
"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import MenuGroup from "./MenuGroup";

type Role = any;

type Item = {
  kind: "item";
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  activeExact?: boolean; // quando true, só ativa em igualdade exata
};

type Group = {
  kind: "group";
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  items: Item[];
};

export type Entry = Item | Group;

type Props = {
  data?: Entry[]; // <- agora é opcional
  role?: Role;
};

// fallback vazio para não impor ícones/rotas quando o chamamos como <Menu />
const DEFAULT_MENU: Entry[] = [];

function canSee(allowed?: Role[], userRole?: Role) {
  if (!allowed || allowed.length === 0) return true;
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export default function Menu({ data, role }: Props) {
  const pathname = usePathname();

  // Usa o que vier por props; se não vier nada, fica vazio (sem quebrar o build)
  const entries: Entry[] = useMemo(
    () => (data && data.length ? data : DEFAULT_MENU),
    [data]
  );

  // Filtra por role (tanto grupos quanto itens)
  const visible: Entry[] = useMemo(() => {
    const out: Entry[] = [];
    for (const e of entries) {
      if ((e as Group).kind === "group") {
        const g = e as Group;
        // grupo só aparece se o utilizador puder ver o grupo
        if (!canSee(g.roles, role)) continue;
        const items = g.items.filter((it) => canSee(it.roles, role));
        if (items.length > 0) out.push({ ...g, items });
      } else {
        const it = e as Item;
        if (canSee(it.roles, role)) out.push(it);
      }
    }
    return out;
  }, [entries, role]);

  // Achamos o item com a rota "mais específica" que corresponde ao pathname atual.
  // Isto evita que /dashboard e /dashboard/system fiquem ativos em simultâneo.
  const bestHref = useMemo(() => {
    const flatItems: Item[] = visible.flatMap((e) =>
      (e as Group).kind === "group" ? (e as Group).items : [e as Item]
    );

    // Normalizador de path para comparação estável
    const norm = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);
    const pathNow = norm(pathname || "/");

    let winner = "";
    for (const it of flatItems) {
      const h = norm(it.href);
      if (!h) continue;

      const match = it.activeExact
        ? pathNow === h
        : pathNow === h || pathNow.startsWith(h + "/");

      if (match && h.length > winner.length) {
        winner = it.href; // guardamos o href original
      }
    }
    return winner;
  }, [visible, pathname]);

  return (
    <nav className="fp-nav" aria-label="Principal">
      {visible.map((e, idx) =>
        (e as Group).kind === "group" ? (
          // Não passamos 'role' para evitar erro de tipos no MenuGroup
          <MenuGroup key={idx} group={e as Group} pathname={pathname} />
        ) : (
          <a
            key={(e as Item).href}
            href={(e as Item).href}
            className="nav-item"
            data-active={(e as Item).href === bestHref ? "true" : "false"}
          >
            {(e as Item).icon && (
              <span className="nav-icon">{(e as Item).icon}</span>
            )}
            <span className="nav-label">{(e as Item).label}</span>
          </a>
        )
      )}
    </nav>
  );
}
