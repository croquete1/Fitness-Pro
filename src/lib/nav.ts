// src/lib/nav.ts

// --- Tipos base (mantém estes nomes para compatibilidade) ---
export type UserRole = "ADMIN" | "PT" | "CLIENT" | "ALL";
export type IconName =
  | "dashboard"
  | "sessions"
  | "messages"
  | "plans"
  | "library"
  | "admin";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: IconName;
  showFor: UserRole[];
  children?: NavItem[];
};

// --- Navegação (imutável) ---
export const NAV_ITEMS: ReadonlyArray<NavItem> = Object.freeze([
  // Base (todos os utilizadores autenticados)
  { key: "home",      label: "Início",        href: "/dashboard",              icon: "dashboard", showFor: ["ALL"] },
  { key: "sessions",  label: "Sessões",       href: "/dashboard/sessions",     icon: "sessions",  showFor: ["ALL"] },
  { key: "messages",  label: "Mensagens",     href: "/dashboard/messages",     icon: "messages",  showFor: ["ALL"] },

  // Área PT
  { key: "pt-plans",  label: "Planos (PT)",   href: "/dashboard/pt/plans",     icon: "plans",     showFor: ["PT", "ADMIN"] },
  { key: "pt-lib",    label: "Biblioteca",    href: "/dashboard/pt/library",   icon: "library",   showFor: ["PT", "ADMIN"] },

  // Administração (se existir)
  { key: "admin",     label: "Administração", href: "/dashboard/admin",        icon: "admin",     showFor: ["ADMIN"] },
]);

// --- Helper seguro (devolve cópia mutável e já filtrada pelo role) ---
export function navFor(role?: UserRole): NavItem[] {
  const r: UserRole = role ?? "ALL";

  const includeByRole = (item: NavItem) =>
    item.showFor.includes("ALL") || item.showFor.includes(r);

  const deepCopy = (items: ReadonlyArray<NavItem>): NavItem[] =>
    items
      .filter(includeByRole)
      .map((i) => ({
        ...i,
        children: i.children ? deepCopy(i.children) : undefined,
      }));

  return deepCopy(NAV_ITEMS);
}
