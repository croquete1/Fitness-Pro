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

/** Normaliza qualquer role (maiúsculas/minúsculas) para o slug da app. */
export function toAppRole(role?: string | null): AppRole {
  const r = (role || '').toString().trim();
  switch (r) {
    case 'admin':
    case 'pt':
    case 'client':
      return r;
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

/** Converte para o enum usado no prisma/DB. */
export function toDbRole(role?: string | null): DbRole {
  return APP_TO_DB[toAppRole(role)];
}

/** Alias: muitas páginas usam `normalizeRole` — mantém igual a `toAppRole`. */
export function normalizeRole(role?: string | null): AppRole {
  return toAppRole(role);
}

export function isAdmin(role?: string | null): boolean  { return toAppRole(role) === 'admin'; }
export function isPT(role?: string | null): boolean     { return toAppRole(role) === 'pt'; }
export function isClient(role?: string | null): boolean { return toAppRole(role) === 'client'; }

// ---------- Faturação: admin sempre; PT só se estiver numa allowlist ----------

/** User flexível (session.user, etc.) */
export type AnyUser = {
  id?: string | null;
  email?: string | null;
  role?: AppRole | DbRole | string | null;
};

/** Utilitário para ler listas CSV das env vars no Vercel. */
function parseCsvEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

const ALLOWLIST_PT_IDS    = parseCsvEnv('BILLING_PT_IDS');    // ex: "clu_123,clu_456"
const ALLOWLIST_PT_EMAILS = parseCsvEnv('BILLING_PT_EMAILS'); // ex: "joao@ex.com,maria@ex.com"

/**
 * PT pode aceder à Faturação apenas se:
 *  - for admin (sempre true), OU
 *  - role for 'pt' E id/email estiver nas allowlists.
 * Clientes nunca.
 */
export function isBillingAllowedForPT(user: AnyUser | null | undefined): boolean {
  const role = toAppRole(user?.role as any);
  if (role === 'admin') return true;
  if (role !== 'pt') return false;

  const id    = user?.id ?? undefined;
  const email = user?.email ?? undefined;

  if (id && ALLOWLIST_PT_IDS.includes(id)) return true;
  if (email && ALLOWLIST_PT_EMAILS.includes(email)) return true;

  // Fallback local opcional (mantém vazio ou preenche para dev local)
  const LOCAL_ALLOWLIST_IDS: string[] = [];
  const LOCAL_ALLOWLIST_EMAILS: string[] = [];
  if (id && LOCAL_ALLOWLIST_IDS.includes(id)) return true;
  if (email && LOCAL_ALLOWLIST_EMAILS.includes(email)) return true;

  return false;
}

/** Helper genérico caso quiseres usar noutros sítios. */
export function hasBillingAccess(user: AnyUser | null | undefined): boolean {
  const role = toAppRole(user?.role as any);
  if (role === 'admin') return true;
  if (role === 'pt') return isBillingAllowedForPT(user);
  return false;
}
