// src/lib/roles.ts
import { Role as PrismaRole } from '@prisma/client';

/** Slug usado na app/UI */
export type AppRole = 'admin' | 'pt' | 'client';
/** Enum do Prisma/DB (mantemos o alias DbRole para compatibilidade) */
export type DbRole = PrismaRole;

// ----------------- Mapeamentos -----------------
export const APP_TO_DB: Record<AppRole, DbRole> = {
  admin:   PrismaRole.ADMIN,
  pt:      PrismaRole.TRAINER,
  client:  PrismaRole.CLIENT,
};

export const DB_TO_APP: Record<DbRole, AppRole> = {
  [PrismaRole.ADMIN]:   'admin',
  [PrismaRole.TRAINER]: 'pt',
  [PrismaRole.CLIENT]:  'client',
};

// ----------------- Type guards -----------------
function isDbRole(x: unknown): x is DbRole {
  return (
    x === PrismaRole.ADMIN   ||
    x === PrismaRole.TRAINER ||
    x === PrismaRole.CLIENT
  );
}

function isAppRole(x: unknown): x is AppRole {
  return x === 'admin' || x === 'pt' || x === 'client';
}

// ----------------- Normalização -----------------
/** Aceita qualquer coisa (inclusive `unknown`) e normaliza para o slug da app. */
export function toAppRole(role?: unknown): AppRole {
  // Já é enum do Prisma?
  if (isDbRole(role)) return DB_TO_APP[role];

  // String? Normalizamos.
  const s = String(role ?? '').trim();
  if (isAppRole(s)) return s;

  // Sinónimos comuns
  switch (s.toLowerCase()) {
    case 'trainer':
    case 'personal_trainer':
    case 'personal-trainer':
    case 'treinador':
    case 'pt':
      return 'pt';
    case 'admin':
      return 'admin';
    case 'client':
    case 'cliente':
      return 'client';
    // Se vier vazio/desconhecido, cai para cliente
    default:
      return 'client';
  }
}

/** Converte para o enum do Prisma/DB. Também aceita `unknown`. */
export function toDbRole(role?: unknown): DbRole {
  if (isDbRole(role)) return role;
  return APP_TO_DB[toAppRole(role)];
}

/** Alias antigo usado em várias páginas. */
export function normalizeRole(role?: unknown): AppRole {
  return toAppRole(role);
}

// Helpers simples
export function isAdmin(role?: unknown): boolean  { return toAppRole(role) === 'admin'; }
export function isPT(role?: unknown): boolean     { return toAppRole(role) === 'pt'; }
export function isClient(role?: unknown): boolean { return toAppRole(role) === 'client'; }

// ----------------- Faturação -----------------
export type AnyUser = {
  id?: string | null;
  email?: string | null;
  role?: AppRole | DbRole | string | null;
};

function parseCsvEnv(name: string): string[] {
  try {
    const raw = process.env[name];
    if (!raw) return [];
    return raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
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

  // Fallback local opcional – podes preencher estes arrays em dev
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
