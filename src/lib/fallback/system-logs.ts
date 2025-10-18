import { buildAuditLogDashboard } from '@/lib/system/logs/dashboard';
import type { AuditLogRecord } from '@/lib/system/logs/types';

function iso(date: Date): string {
  return date.toISOString();
}

function minutesAgo(base: Date, minutes: number): Date {
  return new Date(base.getTime() - minutes * 60_000);
}

function createLog(
  id: string,
  when: Date,
  overrides: Partial<AuditLogRecord>,
): AuditLogRecord {
  return {
    id,
    createdAt: iso(when),
    kind: 'OTHER',
    category: 'system',
    action: 'update',
    targetType: 'GENERIC',
    targetId: null,
    target: null,
    actorId: 'system-demo',
    actor: 'Equipa Neo',
    note: null,
    details: null,
    meta: null,
    payload: null,
    ip: '10.0.0.1',
    ...overrides,
  } satisfies AuditLogRecord;
}

const TRAINERS = [
  { id: 'trainer-andre-pires', name: 'André Pires' },
  { id: 'trainer-sara-oliveira', name: 'Sara Oliveira' },
  { id: 'trainer-ines-magalhaes', name: 'Inês Magalhães' },
  { id: 'trainer-tiago-neves', name: 'Tiago Neves' },
];

const CLIENTS = [
  { id: 'client-ana-marques', name: 'Ana Marques' },
  { id: 'client-joao-pires', name: 'João Pires' },
  { id: 'client-maria-costa', name: 'Maria Costa' },
  { id: 'client-ricardo-fonseca', name: 'Ricardo Fonseca' },
  { id: 'client-sara-nogueira', name: 'Sara Nogueira' },
];

function seedLogs(now: Date): AuditLogRecord[] {
  const logs: AuditLogRecord[] = [];

  // Autenticação recente.
  logs.push(
    createLog('audit-login-ana', minutesAgo(now, 35), {
      kind: 'LOGIN',
      category: 'auth.session',
      action: 'login',
      actorId: CLIENTS[0].id,
      actor: CLIENTS[0].name,
      targetType: 'AUTH_SESSION',
      targetId: 'session-ana',
      ip: '188.250.10.14',
      note: 'Sessão iniciada com MFA activado.',
    }),
    createLog('audit-login-tiago', minutesAgo(now, 42), {
      kind: 'LOGIN',
      category: 'auth.session',
      action: 'login',
      actorId: TRAINERS[3].id,
      actor: TRAINERS[3].name,
      targetType: 'AUTH_SESSION',
      targetId: 'session-tiago',
      ip: '188.250.10.22',
      note: 'Sessão iniciada via app móvel.',
    }),
    createLog('audit-login-failed', minutesAgo(now, 44), {
      kind: 'LOGIN_FAILED',
      category: 'auth.failed',
      action: 'login_failed',
      actorId: CLIENTS[1].id,
      actor: CLIENTS[1].name,
      targetType: 'AUTH_SESSION',
      targetId: 'session-joao',
      ip: '188.250.10.8',
      note: 'Password incorrecta. Bloqueio após 3 tentativas.',
    }),
  );

  // Alterações administrativas.
  logs.push(
    createLog('audit-roles-update', minutesAgo(now, 62), {
      kind: 'ROLE_UPDATE',
      category: 'admin.users',
      action: 'role_granted',
      actorId: 'admin-marta-sousa',
      actor: 'Marta Sousa',
      targetType: 'USER',
      targetId: TRAINERS[0].id,
      target: TRAINERS[0].name,
      note: 'Perfil actualizado para PT Senior.',
      meta: { previous_role: 'TRAINER', new_role: 'PT_SENIOR' },
    }),
    createLog('audit-plan-duplicate', minutesAgo(now, 75), {
      kind: 'PLAN_CLONED',
      category: 'plans.library',
      action: 'plan_duplicate',
      actorId: TRAINERS[1].id,
      actor: TRAINERS[1].name,
      targetType: 'PLAN',
      targetId: 'plan-hiit-pro',
      target: 'Plano HIIT Pro',
      note: 'Plano duplicado a partir do modelo HIIT Primavera.',
    }),
    createLog('audit-plan-update', minutesAgo(now, 98), {
      kind: 'PLAN_UPDATED',
      category: 'plans.sessions',
      action: 'plan_session_updated',
      actorId: TRAINERS[2].id,
      actor: TRAINERS[2].name,
      targetType: 'PLAN_SESSION',
      targetId: 'plan-ana-dia3',
      target: 'Plano Ana — Sessão 3',
      note: 'Carga ajustada para 24kg no agachamento frontal.',
    }),
  );

  // Comunicação com clientes.
  logs.push(
    createLog('audit-message-sent', minutesAgo(now, 120), {
      kind: 'NOTIFICATION_SENT',
      category: 'notifications.outbound',
      action: 'message_sent',
      actorId: TRAINERS[0].id,
      actor: TRAINERS[0].name,
      targetType: 'MESSAGE',
      targetId: 'msg-ana-8732',
      target: CLIENTS[0].name,
      note: 'Resumo semanal enviado para a cliente.',
    }),
    createLog('audit-notification-failed', minutesAgo(now, 128), {
      kind: 'NOTIFICATION_FAILED',
      category: 'notifications.outbound',
      action: 'message_failed',
      actorId: TRAINERS[1].id,
      actor: TRAINERS[1].name,
      targetType: 'MESSAGE',
      targetId: 'msg-ricardo-1291',
      target: CLIENTS[3].name,
      note: 'Entrega via SMS falhou — número sem cobertura.',
    }),
  );

  // Facturação e compliance.
  logs.push(
    createLog('audit-invoice-issued', minutesAgo(now, 160), {
      kind: 'INVOICE_ISSUED',
      category: 'billing.invoices',
      action: 'invoice_issued',
      actorId: 'finance-helena',
      actor: 'Helena Duarte',
      targetType: 'INVOICE',
      targetId: 'PT-2024-0016',
      target: CLIENTS[4].name,
      note: 'Fatura emitida para pacote PT 10 sessões.',
      payload: { amount: 320, currency: 'EUR' },
    }),
    createLog('audit-invoice-refunded', minutesAgo(now, 188), {
      kind: 'INVOICE_REFUNDED',
      category: 'billing.invoices',
      action: 'invoice_refunded',
      actorId: 'finance-helena',
      actor: 'Helena Duarte',
      targetType: 'INVOICE',
      targetId: 'PT-2024-0007',
      target: CLIENTS[2].name,
      note: 'Reembolso parcial após lesão reportada.',
      payload: { amount: 80, reason: 'injury' },
    }),
  );

  // Alertas de segurança históricos.
  logs.push(
    createLog('audit-security-ip', minutesAgo(now, 260), {
      kind: 'SECURITY_ALERT',
      category: 'security.firewall',
      action: 'ip_blocked',
      actor: 'Firewall Edge',
      actorId: 'system-firewall',
      targetType: 'IP',
      targetId: '185.30.10.87',
      target: '185.30.10.87',
      note: 'Endereço IP bloqueado após 15 tentativas inválidas.',
    }),
    createLog('audit-security-mfa', minutesAgo(now, 300), {
      kind: 'SECURITY_ALERT',
      category: 'security.mfa',
      action: 'mfa_enforced',
      actorId: 'admin-marta-sousa',
      actor: 'Marta Sousa',
      targetType: 'USER',
      targetId: TRAINERS[3].id,
      target: TRAINERS[3].name,
      note: 'MFA obrigatório activado para acesso ao backoffice.',
    }),
  );

  // Eventos históricos nos últimos 90 dias para gerar tendência.
  for (let day = 1; day <= 28; day += 1) {
    const base = minutesAgo(now, day * 24 * 60 + 20);
    const trainer = TRAINERS[day % TRAINERS.length];
    const client = CLIENTS[day % CLIENTS.length];
    logs.push(
      createLog(`audit-plan-${day}`, base, {
        kind: 'PLAN_UPDATED',
        category: 'plans.sessions',
        action: 'plan_session_updated',
        actorId: trainer.id,
        actor: trainer.name,
        targetType: 'PLAN_SESSION',
        targetId: `plan-${client.id}-dia-${(day % 5) + 1}`,
        target: `${client.name} — Sessão ${(day % 5) + 1}`,
        note: 'Carga ajustada e notas de recuperação registadas.',
      }),
    );

    if (day % 5 === 0) {
      logs.push(
        createLog(`audit-login-past-${day}`, minutesAgo(now, day * 24 * 60 + 55), {
          kind: 'LOGIN',
          category: 'auth.session',
          action: 'login',
          actorId: client.id,
          actor: client.name,
          targetType: 'AUTH_SESSION',
          targetId: `session-${client.id}-${day}`,
          ip: `188.250.10.${20 + day}`,
        }),
      );
    }
  }

  return logs;
}

export function getSystemLogsDashboardFallback(rangeDays = 14) {
  const now = new Date();
  const base = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    10,
    15,
    0,
    0,
  );
  const logs = seedLogs(base);
  return buildAuditLogDashboard(logs, { rangeDays, now: base });
}

export const fallbackSystemLogsDashboard = getSystemLogsDashboardFallback();
