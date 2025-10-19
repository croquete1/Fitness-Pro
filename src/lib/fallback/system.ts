import { buildSystemDashboard } from '../system/dashboard';
import {
  type SystemDashboardData,
  type SystemInvoiceRecord,
  type SystemNotificationRecord,
  type SystemSessionRecord,
  type SystemUserRecord,
  type SystemUserRole,
  type SystemUserStatus,
} from '../system/types';

const USER_ROLES: SystemUserRole[] = ['admin', 'trainer', 'client', 'client', 'client', 'staff'];
const USER_STATUSES: SystemUserStatus[] = ['active', 'active', 'pending', 'invited', 'active', 'suspended'];
const TRAINER_NAMES = [
  'Ana Marques',
  'João Pires',
  'Maria Costa',
  'Pedro Almeida',
  'Sara Nogueira',
  'Miguel Tavares',
];
const CLIENT_NAMES = [
  'Rita Figueiredo',
  'Tiago Neves',
  'Beatriz Lemos',
  'Helena Duarte',
  'Ricardo Fonseca',
  'Andreia Lopes',
  'Nuno Ribeiro',
  'Inês Carvalho',
  'Vasco Faria',
  'Telma Guerra',
];
const SESSION_LOCATIONS = ['Box Lisboa', 'Estúdio Norte', 'Online', 'Outdoor Parque', 'Box Porto'];
const CHANNELS: SystemNotificationRecord['channel'][] = ['push', 'email', 'sms', 'in-app'];

function rotate<T>(values: readonly T[], index: number): T {
  return values[index % values.length]!;
}

function buildUsers(now: Date, total: number): SystemUserRecord[] {
  const items: SystemUserRecord[] = [];
  for (let index = 0; index < total; index += 1) {
    const createdAt = new Date(now.getTime() - index * 2 * 86_400_000);
    const status = rotate(USER_STATUSES, index);
    const role = rotate(USER_ROLES, index);
    items.push({
      id: `fb-user-${index.toString().padStart(3, '0')}`,
      role,
      status,
      createdAt: createdAt.toISOString(),
      lastSeenAt: new Date(createdAt.getTime() + 6 * 86_400_000).toISOString(),
    });
  }
  return items;
}

function buildSessions(now: Date, total: number): SystemSessionRecord[] {
  const items: SystemSessionRecord[] = [];
  const statuses: SystemSessionRecord['status'][] = ['completed', 'scheduled', 'cancelled', 'completed', 'completed'];
  for (let index = 0; index < total; index += 1) {
    const scheduledAt = new Date(now.getTime() - index * 86_400_000 + (index % 3) * 90 * 60 * 1000);
    const trainer = rotate(TRAINER_NAMES, index);
    const client = rotate(CLIENT_NAMES, index + 3);
    items.push({
      id: `fb-session-${index.toString().padStart(3, '0')}`,
      status: rotate(statuses, index),
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: 60,
      trainerName: trainer,
      clientName: client,
      location: rotate(SESSION_LOCATIONS, index),
    });
  }
  return items;
}

function buildNotifications(now: Date, total: number): SystemNotificationRecord[] {
  const items: SystemNotificationRecord[] = [];
  const statuses: SystemNotificationRecord['status'][] = ['delivered', 'delivered', 'failed', 'pending'];
  for (let index = 0; index < total; index += 1) {
    const createdAt = new Date(now.getTime() - index * 8 * 60 * 60 * 1000);
    const status = rotate(statuses, index);
    const deliveredAt = status === 'failed' ? null : new Date(createdAt.getTime() + 3 * 60 * 1000).toISOString();
    items.push({
      id: `fb-notification-${index.toString().padStart(3, '0')}`,
      status,
      channel: rotate(CHANNELS, index),
      createdAt: createdAt.toISOString(),
      deliveredAt,
      title: status === 'failed' ? 'Falha de envio' : 'Actualização da agenda',
      targetName: rotate(CLIENT_NAMES, index),
    });
  }
  return items;
}

function buildInvoices(now: Date, total: number): SystemInvoiceRecord[] {
  const items: SystemInvoiceRecord[] = [];
  const statuses: SystemInvoiceRecord['status'][] = ['paid', 'paid', 'pending', 'paid', 'refunded'];
  for (let index = 0; index < total; index += 1) {
    const issuedAt = new Date(now.getTime() - index * 3 * 86_400_000);
    const status = rotate(statuses, index);
    const amount = 45 + (index % 5) * 25;
    items.push({
      id: `fb-invoice-${index.toString().padStart(3, '0')}`,
      status,
      amount,
      issuedAt: issuedAt.toISOString(),
      paidAt: status === 'paid' ? new Date(issuedAt.getTime() + 2 * 86_400_000).toISOString() : null,
      clientName: rotate(CLIENT_NAMES, index + 2),
    });
  }
  return items;
}

export function getSystemDashboardFallback(rangeDays = 14): SystemDashboardData {
  const now = new Date();
  const users = buildUsers(now, 28);
  const sessions = buildSessions(now, Math.max(rangeDays + 6, 18));
  const notifications = buildNotifications(now, Math.max(rangeDays * 2, 20));
  const invoices = buildInvoices(now, Math.max(rangeDays, 16));
  return buildSystemDashboard({
    now,
    rangeDays,
    users,
    sessions,
    notifications,
    invoices,
  });
}

export const fallbackSystemDashboard: SystemDashboardData = getSystemDashboardFallback();
