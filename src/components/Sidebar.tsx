"use client";

import { useMemo, useRef } from "react";
import useSidebarState from "./SidebarWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Apenas dados serializáveis
function buildMenu() {
  return [
    {
      section: "GERAL",
      items: [
        { label: "Dashboard", href: "/dashboard", emoji: "📊" },
        { label: "Relatórios", href: "/dashboard/reports", emoji: "📈" },
        { label: "Definições", href: "/dashboard/settings", emoji: "⚙️" },
      ],
    },
    {
      section: "PT",
      items: [
        { label: "Clientes", href: "/dashboard/pt/clients", emoji: "🧑‍🤝‍🧑" },
        { label: "Planos", href: "/dashboard/pt/plans", emoji: "📘" },
        { label: "Biblioteca", href: "/dashboard/pt/library", emoji: "📚" },
      ],
    },
    {
      section: "ADMIN",
      items: [
        { label: "Aprovações", href: "/dashboard/admin/approvals", emoji: "✅" },
        { label: "Utilizadores", href: "/dashboard/admin/users", emoji: "👥" },
      ],
    },
    {
      section: "SISTEMA",
      items: [{ label: "Saúde do sistema", href: "/dashboard/system/health", emoji: "🛟" }],
    },
  ];
}

export default function Sidebar() {
  const { collapsed, pinned, openOverlay, closeOverlay, overlayOpen, togglePinned } =
    useSidebarState();

  const pathname = usePathname();
  const data = useMemo(() => buildMenu(), []);
  const railRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => {
    if (!pinned && collapsed) openOverlay();
  };
  const onMouseLeave = () => {
    if (!pinned) closeOverlay();
  };

  const isOpen = pinned ? !collapsed : overlayOpen;

  return (
    <>
      {/* RAIL compacto (64px) – participa no fluxo */}
      <div className="z-40 flex-shrink-0 w-16 border-r border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div
          ref={railRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="h-dvh flex flex-col items-center py-4 gap-6"
        >
          {/* logo + pin */}
          <div className="flex flex-col items-center gap-2">
            <Link href="/dashboard" aria-label="Home" className="rounded-xl shadow-sm p-2">
              <span className="text-2xl">💪</span>
            </Link>
            <button
              title={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
              className="text-sm opacity-70 hover:opacity-100 transition"
            >
              {pinned ? "📌" : "📍"}
            </button>
          </div>

          {/* ícones do menu */}
          <nav className="flex-1 flex flex-col items-center gap-5">
            {data.flatMap((sec) =>
              sec.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className={clsx(
                    "size-9 rounded-xl grid place-items-center text-lg transition",
                    pathname?.startsWith(it.href)
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-slate-50"
                  )}
                >
                  <span aria-hidden>{it.emoji}</span>
                </Link>
              ))
            )}
          </nav>
        </div>
      </div>

      {/* DRAWER expandido – SEMPRE fixed para não empurrar o header */}
      <aside
        aria-hidden={!isOpen}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={clsx(
          "fixed left-16 top-0 h-dvh w-72 z-50",
          "border-r border-black/5 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70",
          "transition-[transform,opacity] duration-350 ease-[cubic-bezier(.22,1,.36,1)]",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          "overflow-y-auto"
        )}
      >
        <div className="px-4 py-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 mb-4">
            Navegação
          </div>

          {data.map((sec) => (
            <div key={sec.section} className="mb-5">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 mb-2">
                {sec.section}
              </div>
              {/* 👇 sem bullets */}
              <ul className="list-none p-0 m-0 space-y-1.5">
                {sec.items.map((it) => {
                  const active = pathname?.startsWith(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={clsx(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                          active
                            ? "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <span className="text-lg">{it.emoji}</span>
                        <span className="truncate">{it.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Backdrop apenas quando não está pinada */}
      {!pinned && overlayOpen && (
        <button
          aria-label="Fechar menu"
          onClick={closeOverlay}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        />
      )}
    </>
  );
}
