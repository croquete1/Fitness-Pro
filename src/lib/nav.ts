// src/lib/nav.ts
export type UserRole = "ADMIN" | "TRAINER" | "CLIENT";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: import("@/components/icons").IconName;
  showFor: Array<UserRole | "ALL">;
};

export const NAV_ITEMS: ReadonlyArray<NavItem> = Object.freeze([
  // Base (todos)
  { key: "home",      label: "Início",        href: "/dashboard",            icon: "dashboard", showFor: ["ALL"] },
  { key: "sessions",  label: "Sessões",       href: "/dashboard/sessions",   icon: "sessions",  showFor: ["ALL"] },
  { key: "messages",  label: "Mensagens",     href: "/dashboard/messages",   icon: "messages",  showFor: ["ALL"] },
  { key: "profile",   label: "Perfil",        href: "/dashboard/profile",    icon: "profile",   showFor: ["ALL"] },
  { key: "billing",   label: "Faturação",     href: "/dashboard/billing",    icon: "billing",   showFor: ["ALL"] },

  // PT (TRAINER + ADMIN)
  { key: "trainer",        label: "PT (overview)", href: "/dashboard/trainer",       icon: "trainer",        showFor: ["TRAINER","ADMIN"] },
  { key: "pt_clients",     label: "PT · Clientes", href: "/dashboard/pt/clients",    icon: "trainerClients", showFor: ["TRAINER","ADMIN"] },
  { key: "pt_plans",       label: "Planos",        href: "/dashboard/pt/plans",      icon: "trainerPlans",   showFor: ["TRAINER","ADMIN"] },
  { key: "pt_library",     label: "Biblioteca",    href: "/dashboard/pt/library",    icon: "trainerLibrary", showFor: ["TRAINER","ADMIN"] },

  // Admin (apenas ADMIN)
  { key: "admin",          label: "Administração", href: "/dashboard/admin",           icon: "admin",         showFor: ["ADMIN"] },
  { key: "approvals",      label: "Aprovações",    href: "/dashboard/admin/approvals", icon: "approvals",     showFor: ["ADMIN"] },
  { key: "users",          label: "Utilizadores",  href: "/dashboard/admin/users",     icon: "users",         showFor: ["ADMIN"] },
  { key: "roster",         label: "Atribuições",   href: "/dashboard/admin/roster",    icon: "roster",        showFor: ["ADMIN"] },
  { key: "exercises",      label: "Exercícios",    href: "/dashboard/admin/exercises", icon: "exercises",     showFor: ["ADMIN"] },
  { key: "planTemplates",  label: "Templates",     href: "/dashboard/admin/plans",     icon: "planTemplates", showFor: ["ADMIN"] },
  { key: "reports",        label: "Relatórios",    href: "/dashboard/reports",         icon: "reports",       showFor: ["ADMIN"] },
  { key: "system",         label: "Sistema",       href: "/dashboard/system",          icon: "system",        showFor: ["ADMIN"] },
  { key: "logs",           label: "Logs",          href: "/dashboard/system/logs",     icon: "logs",          showFor: ["ADMIN"] },
]);

export function getSidebarItems(role: UserRole) {
  return NAV_ITEMS.filter(i => i.showFor.includes("ALL") || i.showFor.includes(role));
}
