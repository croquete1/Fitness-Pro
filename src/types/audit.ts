// src/types/audit.ts

/** TARGETS válidos para os registos de auditoria. */
export const AUDIT_TARGET_TYPES = {
  USER: 'USER',
  EXERCISE: 'EXERCISE',
  TRAINING_PLAN: 'TRAINING_PLAN',
  TRAINER_CLIENT: 'TRAINER_CLIENT',
} as const;

export type AuditTargetType =
  (typeof AUDIT_TARGET_TYPES)[keyof typeof AUDIT_TARGET_TYPES];

/** KINDS válidos (inclui aliases p/ legado para evitar quebras). */
export const AUDIT_KINDS = {
  // Contas
  ACCOUNT_APPROVAL: 'ACCOUNT_APPROVAL',
  ACCOUNT_ROLE_CHANGE: 'ACCOUNT_ROLE_CHANGE',
  ACCOUNT_STATUS_CHANGE: 'ACCOUNT_STATUS_CHANGE',

  // Exercícios (catálogo global)
  EXERCISE_PUBLISH: 'EXERCISE_PUBLISH',
  EXERCISE_UNPUBLISH: 'EXERCISE_UNPUBLISH',
  EXERCISE_PUBLISH_TOGGLE: 'EXERCISE_PUBLISH_TOGGLE', // legado/compat

  // Planos de treino
  TRAINING_PLAN_CREATE: 'TRAINING_PLAN_CREATE',
  TRAINING_PLAN_UPDATE: 'TRAINING_PLAN_UPDATE',
  TRAINING_PLAN_CLONE:  'TRAINING_PLAN_CLONE',

  // Relações PT-Cliente
  TRAINER_CLIENT_LINK:   'TRAINER_CLIENT_LINK',
  TRAINER_CLIENT_UNLINK: 'TRAINER_CLIENT_UNLINK',

  // Aliases de legado (mantêm o build a passar mesmo que o código antigo exista)
  PLAN_CREATE: 'PLAN_CREATE',
  PLAN_UPDATE: 'PLAN_UPDATE',
} as const;

export type AuditKind = (typeof AUDIT_KINDS)[keyof typeof AUDIT_KINDS];

/** Mapeia strings antigas para o equivalente canónico. */
export function resolveAuditKind(k: string): AuditKind {
  const aliases: Record<string, AuditKind> = {
    PLAN_CREATE: AUDIT_KINDS.TRAINING_PLAN_CREATE,
    PLAN_UPDATE: AUDIT_KINDS.TRAINING_PLAN_UPDATE,
  };
  // devolve o alias canónico, ou a própria string se já for válida,
  // ou um fallback seguro para evitar crash.
  return (aliases[k] ??
          (AUDIT_KINDS as Record<string, AuditKind>)[k] ??
          AUDIT_KINDS.ACCOUNT_STATUS_CHANGE) as AuditKind;
}

/** Estrutura base de um registo de auditoria. */
export interface AuditEntry {
  actorId: string;              // quem fez a ação (UUID)
  kind: AuditKind;              // o tipo de evento
  message?: string;             // frase humana
  targetType?: AuditTargetType; // tipo do alvo (USER/EXERCISE/…)
  targetId?: string | number | null; // id do alvo
  targetLabel?: string;         // label legível do alvo (ex: email)
  /** @deprecated usa targetLabel; mantido só para compat */
  target?: string;
  diff?: unknown;               // payload com alterações
  meta?: Record<string, any>;   // metadados auxiliares
  insertedAt?: string | Date;   // opcional (gerido pelo DB)
}

export type AuditInput = Omit<AuditEntry, 'insertedAt'>;

/** Normaliza um input solto para algo válido e tipado. */
export function coerceAuditInput(input: Partial<AuditEntry>): AuditInput {
  const kind = resolveAuditKind(String(input.kind ?? 'ACCOUNT_STATUS_CHANGE'));
  return {
    actorId: String(input.actorId ?? ''),
    kind,
    message: input.message,
    targetType: input.targetType,
    targetId: input.targetId == null ? undefined : String(input.targetId),
    targetLabel: input.targetLabel ?? input.target, // suporta legado
    diff: input.diff,
    meta: input.meta,
  };
}