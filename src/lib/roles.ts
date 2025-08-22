// Mapeamento de roles entre DB (ENUM) e app (slug)
export type AppRole = 'admin' | 'pt' | 'client';
export type DbRole  = 'ADMIN' | 'TRAINER' | 'CLIENT';

export const APP_TO_DB: Record<AppRole, DbRole> = {
  admin: 'ADMIN',
  pt: 'TRAINER',
  client: 'CLIENT',
};

export const DB_TO_APP: Record<DbRole, AppRole> = {
  ADMIN: 'admin',
  TRAINER: 'pt',
  CLIENT: 'client',
};

/** Aceita qualquer coisa (inclusive `unknown`) e normaliza para o slug da app. */
export function toAppRole(role?: unknown): AppRole {
  const r = String(role ?? '').trim();
  switch (r) {
    // já em formato app
    case 'admin':
    case 'pt':
    case 'client':
      return r as AppRole;
    // enum do DB
    case 'ADMIN':
      return 'admin';
    case 'TRAINER':
      return 'pt';
    case 'CLIENT':
      return 'client';
    default:
      return 'client';
  }
}

/** Converte para o enum usado no prisma/DB. Também aceita `unknown`. */
export function toDbRole(role?: unknown): DbRole {
  return APP_TO_DB[toAppRole(role)];
}

/** Alias antigo usado em várias páginas. */
export function normalizeRole(role?: unknown): AppRole {
  return toAppRole(role);
}

export function isAdmin(role?: unknown): boolean  { return toAppRole(role) === 'admin'; }
export function isPT(role?: unknown): boolean     { return toAppRole(role) === 'pt'; }
export function isClient(role?: unknown): boolean { return toAppRole(role) === 'client'; }

// ---------- Faturação: admin sempre; PT só se estiver numa allowlist ----------
export type AnyUser = {
  id?: string | null;
  email?: string | null;
  role?: AppRole | DbRole | string | null;
};

function parseCsvEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
}

const ALLOWLIST_PT_IDS    = parseCsvEnv('BILLING_PT_IDS');    // ex: "clu_123,clu_456"
const ALLOWLIST_PT_EMAILS = parseCsvEnv('BILLING_PT_EMAILS'); // ex: "joao@ex.com,maria@ex.com"

/** Admin: sempre. PT: só se estiver nas allowlists. Cliente: nunca. */
export function isBillingAllowedForPT(user: AnyUser | null | undefined): boolean {
  const role = toAppRole(user?.role);
  if (role === 'admin') return true;
  if (role !== 'pt') return false;

  const id    = user?.id ?? undefined;
  const email = user?.email ?? undefined;

  if (id && ALLOWLIST_PT_IDS.includes(id)) return true;
  if (email && ALLOWLIST_PT_EMAILS.includes(email)) return true;

  // Fallback local opcional
  const LOCAL_ALLOWLIST_IDS: string[] = [];
  const LOCAL_ALLOWLIST_EMAILS: string[] = [];
  if (id && LOCAL_ALLOWLIST_IDS.includes(id)) return true;
  if (email && LOCAL_ALLOWLIST_EMAILS.includes(email)) return true;

  return false;
}

export function hasBillingAccess(user: AnyUser | null | undefined): boolean {
  const role = toAppRole(user?.role);
  if (role === 'admin') return true;
  if (role === 'pt') return isBillingAllowedForPT(user);
  return false;
}
