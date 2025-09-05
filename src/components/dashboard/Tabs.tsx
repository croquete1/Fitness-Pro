// src/components/dashboard/Tabs.tsx
"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

type Tab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  tabs: Tab[];
  /** Nome do query param para controlar a tab (default: "tab") */
  paramKey?: string;
};

export default function Tabs({ tabs, paramKey = "tab" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const active = sp?.get(paramKey) || tabs[0]?.key || "";

  function setTab(key: string) {
    const q = new URLSearchParams(sp?.toString() ?? "");
    q.set(paramKey, key);
    const href = (pathname + "?" + q.toString()) as Route; // ✅ typed route
    router.push(href);
  }

  return (
    <div
      className="tabs"
      role="tablist"
      aria-label="Navegação por separadores"
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => setTab(t.key)}
            className="btn chip"
            style={{
              background: isActive ? "var(--sidebar-active)" : undefined,
              border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
