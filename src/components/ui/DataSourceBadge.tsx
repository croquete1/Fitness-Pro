"use client";

import * as React from "react";
import clsx from "clsx";

export type DataSourceBadgeProps = {
  source?: "supabase" | "fallback";
  generatedAt?: string | null;
  className?: string;
};

export function describeDataSourceRelative(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes <= 0) return "há instantes";
  if (diffMinutes === 1) return "há 1 minuto";
  if (diffMinutes < 60) return `há ${diffMinutes} minutos`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours === 1) return "há 1 hora";
  if (diffHours < 24) return `há ${diffHours} horas`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 7) return `há ${diffDays} dias`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks === 1) return "há 1 semana";
  if (diffWeeks < 5) return `há ${diffWeeks} semanas`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths === 1) return "há 1 mês";
  if (diffMonths < 12) return `há ${diffMonths} meses`;
  const diffYears = Math.round(diffMonths / 12);
  return `há ${diffYears} ano${diffYears === 1 ? "" : "s"}`;
}

export default function DataSourceBadge({ source, generatedAt, className }: DataSourceBadgeProps) {
  if (!source) return null;
  const tone = source === "supabase" ? "ok" : "warn";
  const label = source === "supabase" ? "Sincronizado com o servidor" : "Sem sincronização activa";
  const relative = describeDataSourceRelative(generatedAt);
  return (
    <span className={clsx("neo-data-badge", className)} data-tone={tone} role="status">
      {label}
      {relative ? ` · ${relative}` : null}
    </span>
  );
}

