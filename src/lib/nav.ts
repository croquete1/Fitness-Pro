// src/lib/nav.ts
// Navegação partilhada por Admin, Personal Trainer e Cliente.
// Apenas os itens (links) variam por role via `showFor`.

export type UserRole = "ADMIN" | "TRAINER" | "CLIENT";
export type Audience = "ALL" | UserRole;

export type NavIcon =
  | "dashboard"
  | "sessions"
  | "messages"
  | "plans"
  | "library"
  | "admin";

export interface NavItem {
  key: string;
  label: string;
  href: `/${string}`;     // força prefixo "/"
  icon: NavIcon;
  showFor: readonly Audience[];
}

// Fonte única (readonly) com validação de tipo em tempo de compilação.
const NAV_SOURCE = [
  // Base (todos)
  { key: "home",      label: "Início",        href: "/dashboard",              icon: "dashboard", showFor: ["ALL"] },
  { key: "sessions",  label: "Sessões",       href: "/dashboard/sessions",     icon: "sessions",  showFor: ["ALL"] },
  { key: "messages",  label: "Mensagens",     href: "/dashboard/messages",     icon: "messages",  showFor: ["ALL"] },

  // Personal Trainer
  { key: "pt-plans",  label: "Planos (PT)",   href: "/dashboard/pt/plans",     icon: "plans",     showFor: ["TRAINER"] },
  { key: "library",   label: "Biblioteca",    href: "/dashboard/pt/library",   icon: "library",   showFor: ["TRAINER"] },

  // Admin
  { key: "admin",     label: "Administração", href: "/dashboard/admin",        icon: "admin",     showFor: ["ADMIN"] },
] satisfies ReadonlyArray<NavItem>;

// Array exportado, imutável por contrato
export const NAV_ITEMS: ReadonlyArray<NavItem> = NAV_SOURCE;

/** Devolve os itens de navegação visíveis para o `role` indicado. */
export function navFor(role: Audience): NavItem[] {
  return NAV_ITEMS.filter(
    (i) => i.showFor.includes("ALL") || i.showFor.includes(role)
  );
}

/** Helper opcional para verificar visibilidade de um item para um role. */
export function isVisibleFor(item: NavItem, role: Audience): boolean {
  return item.showFor.includes("ALL") || item.showFor.includes(role);
}
