// src/lib/nav.ts
// Navegação partilhada (Admin / Trainer / Client) com grupos não-clicáveis.

export type UserRole = 'ADMIN' | 'TRAINER' | 'CLIENT';
export type Audience = 'ALL' | UserRole;

export type NavIcon =
  | 'dashboard'
  | 'sessions'
  | 'messages'
  | 'profile'
  | 'billing'
  | 'reports'
  | 'settings'
  | 'trainer'
  | 'approvals'
  | 'workouts'
  | 'clients'
  | 'library'
  | 'plans'
  | 'exercises'
  | 'users'
  | 'roster'
  | 'admin'
  | 'system'
  | 'logs'
  | 'metrics';

/** Link normal da sidebar */
export interface NavItem {
  kind: 'link';
  key: string;
  label: string;
  href: `/${string}`;
  icon: NavIcon;
  showFor: readonly Audience[];
}

/** Separador/Heading não-clicável */
export interface NavGroup {
  kind: 'group';
  key: string;
  label: string;
  showFor: readonly Audience[];
}

export type NavEntry = NavItem | NavGroup;

/**
 * Fonte única (readonly) — inclui todas as rotas existentes.
 * Mantém a mesma sidebar para todos os perfis, variando apenas `showFor`.
 */
const NAV_SOURCE = [
  // ===== Base (visível para TODOS) =====
  { kind: 'link',  key: 'home',        label: 'Início',         href: '/dashboard',                icon: 'dashboard', showFor: ['ALL'] },
  { kind: 'link',  key: 'sessions',    label: 'Sessões',        href: '/dashboard/sessions',       icon: 'sessions',  showFor: ['ALL'] },
  { kind: 'link',  key: 'messages',    label: 'Mensagens',      href: '/dashboard/messages',       icon: 'messages',  showFor: ['ALL'] },
  { kind: 'link',  key: 'profile',     label: 'Perfil',         href: '/dashboard/profile',        icon: 'profile',   showFor: ['ALL'] },
  { kind: 'link',  key: 'reports',     label: 'Relatórios',     href: '/dashboard/reports',        icon: 'reports',   showFor: ['ALL'] },
  { kind: 'link',  key: 'settings',    label: 'Definições',     href: '/dashboard/settings',       icon: 'settings',  showFor: ['ALL'] },

  // ===== Client =====
  { kind: 'link',  key: 'billing',     label: 'Faturação',      href: '/dashboard/billing',        icon: 'billing',   showFor: ['CLIENT'] },

  // ===== PT — Grupo + links (segmento /dashboard/pt/*) =====
  { kind: 'group', key: 'g-pt',        label: 'Área PT',                                         showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-root',     label: 'Painel PT',      href: '/dashboard/trainer',       icon: 'trainer',   showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-clients',  label: 'Clientes (PT)',  href: '/dashboard/pt/clients',    icon: 'clients',   showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-plans',    label: 'Planos (PT)',    href: '/dashboard/pt/plans',      icon: 'plans',     showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-library',  label: 'Biblioteca',     href: '/dashboard/pt/library',    icon: 'library',   showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-approv',   label: 'Aprovações',     href: '/dashboard/trainer/approvals', icon: 'approvals', showFor: ['TRAINER'] },
  { kind: 'link',  key: 'pt-work',     label: 'Treinos',        href: '/dashboard/trainer/workouts', icon: 'workouts',  showFor: ['TRAINER'] },

  // ===== Admin — Grupo + links =====
  { kind: 'group', key: 'g-admin',     label: 'Administração',                                   showFor: ['ADMIN'] },
  { kind: 'link',  key: 'admin',       label: 'Administração',  href: '/dashboard/admin',         icon: 'admin',     showFor: ['ADMIN'] },
  { kind: 'link',  key: 'a-approv',    label: 'Aprovações',     href: '/dashboard/admin/approvals', icon: 'approvals', showFor: ['ADMIN'] },
  { kind: 'link',  key: 'a-exerc',     label: 'Exercícios',     href: '/dashboard/admin/exercises', icon: 'exercises', showFor: ['ADMIN'] },
  { kind: 'link',  key: 'a-plans',     label: 'Planos (Admin)', href: '/dashboard/admin/plans',     icon: 'plans',     showFor: ['ADMIN'] },
  { kind: 'link',  key: 'a-roster',    label: 'Escala/Equipa',  href: '/dashboard/admin/roster',    icon: 'roster',    showFor: ['ADMIN'] },
  { kind: 'link',  key: 'a-users',     label: 'Utilizadores',   href: '/dashboard/admin/users',     icon: 'users',     showFor: ['ADMIN'] },

  // ===== Sistema — Grupo + links =====
  { kind: 'group', key: 'g-system',    label: 'Sistema',                                        showFor: ['ADMIN'] },
  { kind: 'link',  key: 'sys-root',    label: 'Sistema',        href: '/dashboard/system',        icon: 'system',    showFor: ['ADMIN'] },
  { kind: 'link',  key: 'sys-logs',    label: 'Logs',           href: '/dashboard/system/logs',   icon: 'logs',      showFor: ['ADMIN'] },
  { kind: 'link',  key: 'sys-metrics', label: 'Métricas',       href: '/dashboard/system/metrics',icon: 'metrics',   showFor: ['ADMIN'] },
] as const satisfies ReadonlyArray<NavEntry>;

export const NAV_ITEMS: ReadonlyArray<NavEntry> = NAV_SOURCE;

/** Filtra itens (inclui grupos e links) conforme o role. */
export function navFor(role: Audience): NavEntry[] {
  return NAV_ITEMS.filter(i => i.showFor.includes('ALL') || i.showFor.includes(role));
}

/** Só para links: devolve os visíveis para o role. */
export function navLinksFor(role: Audience): NavItem[] {
  return navFor(role).filter((e): e is NavItem => e.kind === 'link');
}

/** Helper: visibilidade de qualquer entrada para o role. */
export function isVisibleFor(entry: NavEntry, role: Audience): boolean {
  return entry.showFor.includes('ALL') || entry.showFor.includes(role);
}

/** Navegação cliente/SSR-safe (sem marcar o módulo como 'use client') */
export function navigate(to: string, openInNew: boolean) {
  if (typeof window === 'undefined') return; // SSR no-op
  if (openInNew) {
    window.open(to, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(to);
  }
}
