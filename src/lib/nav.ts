// src/lib/nav.ts
// Navegação partilhada por Admin, Personal Trainer e Cliente.
// O layout/comportamento da sidebar NÃO foi alterado — apenas a lista de páginas.
// Cada item indica para que audiência (role) é visível via `showFor`.

export type UserRole = "ADMIN" | "TRAINER" | "CLIENT";
export type Audience = "ALL" | UserRole;

export type NavIcon =
  | "dashboard"
  | "sessions"
  | "messages"
  | "profile"
  | "billing"
  | "reports"
  | "settings"
  | "trainer"
  | "approvals"
  | "workouts"
  | "clients"
  | "library"
  | "plans"
  | "exercises"
  | "users"
  | "roster"
  | "admin"
  | "system"
  | "logs"
  | "metrics";

export interface NavItem {
  key: string;
  label: string;
  href: `/${string}`;            // força prefixo "/"
  icon: NavIcon;
  showFor: readonly Audience[];  // "ALL" ou role específico
}

/**
 * Fonte única de navegação (readonly). Inclui TODAS as rotas existentes:
 * - Base (ALL): dashboard, sessões, mensagens, perfil, relatórios, definições
 * - Client: billing
 * - Trainer: /dashboard/pt/* e /dashboard/trainer/*
 * - Admin: /dashboard/admin/* e /dashboard/system/*
 */
const NAV_SOURCE = [
  // ===== Base (visível para TODOS) =====
  { key: "home",       label: "Início",        href: "/dashboard",               icon: "dashboard", showFor: ["ALL"] },
  { key: "sessions",   label: "Sessões",       href: "/dashboard/sessions",      icon: "sessions",  showFor: ["ALL"] },
  { key: "messages",   label: "Mensagens",     href: "/dashboard/messages",      icon: "messages",  showFor: ["ALL"] },
  { key: "profile",    label: "Perfil",        href: "/dashboard/profile",       icon: "profile",   showFor: ["ALL"] },
  { key: "reports",    label: "Relatórios",    href: "/dashboard/reports",       icon: "reports",   showFor: ["ALL"] },
  { key: "settings",   label: "Definições",    href: "/dashboard/settings",      icon: "settings",  showFor: ["ALL"] },

  // ===== Client =====
  { key: "billing",    label: "Faturação",     href: "/dashboard/billing",       icon: "billing",   showFor: ["CLIENT"] },

  // ===== Trainer (segmento PT) =====
  { key: "pt-root",       label: "Área PT",         href: "/dashboard/pt",            icon: "trainer",    showFor: ["TRAINER"] },
  { key: "pt-clients",    label: "Clientes (PT)",   href: "/dashboard/pt/clients",    icon: "clients",    showFor: ["TRAINER"] },
  { key: "pt-plans",      label: "Planos (PT)",     href: "/dashboard/pt/plans",      icon: "plans",      showFor: ["TRAINER"] },
  { key: "pt-library",    label: "Biblioteca (PT)", href: "/dashboard/pt/library",    icon: "library",    showFor: ["TRAINER"] },

  // ===== Trainer (segmento trainer) =====
  { key: "trainer-root",      label: "Trainer",              href: "/dashboard/trainer",             icon: "trainer",   showFor: ["TRAINER"] },
  { key: "trainer-approvals", label: "Aprovações (Trainer)", href: "/dashboard/trainer/approvals",   icon: "approvals", showFor: ["TRAINER"] },
  { key: "trainer-workouts",  label: "Treinos",               href: "/dashboard/trainer/workouts",    icon: "workouts",  showFor: ["TRAINER"] },

  // ===== Admin =====
  { key: "admin",          label: "Administração",  href: "/dashboard/admin",           icon: "admin",     showFor: ["ADMIN"] },
  { key: "admin-approvals",label: "Aprovações",     href: "/dashboard/admin/approvals", icon: "approvals", showFor: ["ADMIN"] },
  { key: "admin-exercises",label: "Exercícios",     href: "/dashboard/admin/exercises", icon: "exercises", showFor: ["ADMIN"] },
  { key: "admin-plans",    label: "Planos (Admin)", href: "/dashboard/admin/plans",     icon: "plans",     showFor: ["ADMIN"] },
  { key: "admin-roster",   label: "Escala/Equipa",  href: "/dashboard/admin/roster",    icon: "roster",    showFor: ["ADMIN"] },
  { key: "admin-users",    label: "Utilizadores",   href: "/dashboard/admin/users",     icon: "users",     showFor: ["ADMIN"] },

  // ===== System (Admin) =====
  { key: "system",         label: "Sistema",        href: "/dashboard/system",          icon: "system",    showFor: ["ADMIN"] },
  { key: "system-logs",    label: "Logs",           href: "/dashboard/system/logs",     icon: "logs",      showFor: ["ADMIN"] },
  { key: "system-metrics", label: "Métricas",       href: "/dashboard/system/metrics",  icon: "metrics",   showFor: ["ADMIN"] },
] as const satisfies ReadonlyArray<NavItem>;

// Export imutável (evita erro “readonly assigned to mutable”)
export const NAV_ITEMS: ReadonlyArray<NavItem> = NAV_SOURCE;

/** Itens visíveis para o `role` indicado */
export function navFor(role: Audience): NavItem[] {
  return NAV_ITEMS.filter(i => i.showFor.includes("ALL") || i.showFor.includes(role));
}

/** Helper extra: visibilidade de um item para determinado role */
export function isVisibleFor(item: NavItem, role: Audience): boolean {
  return item.showFor.includes("ALL") || item.showFor.includes(role);
}
