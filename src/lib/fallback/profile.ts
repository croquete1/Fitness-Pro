import { buildProfileDashboard } from '@/lib/profile/dashboard';
import type {
  ProfileAccount,
  ProfileDashboardData,
} from '@/lib/profile/types';
import { getFallbackClientSessions, getFallbackSessionRequests } from '@/lib/fallback/sessions';

const fallbackAccount: ProfileAccount = {
  id: 'client-neo',
  email: 'cliente@fitness.pro',
  name: 'Joana Cardoso',
  username: 'joana.cardoso',
  avatarUrl: 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=facearea&w=256&h=256&q=80',
  role: 'CLIENT',
  phone: '+351910000000',
  birthDate: '1992-04-18',
  bio: 'Entusiasta de triatlo com foco em força funcional e recuperação.',
  createdAt: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const fallbackNotifications = [
  {
    id: 'ntf-prof-001',
    type: 'session',
    read: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    metadata: { channel: 'push' },
  },
  {
    id: 'ntf-prof-002',
    type: 'reminder',
    read: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: { channel: 'email' },
  },
  {
    id: 'ntf-prof-003',
    type: 'insight',
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { channel: 'email' },
  },
  {
    id: 'ntf-prof-004',
    type: 'billing',
    read: true,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { channel: 'email' },
  },
];

const fallbackDevices = [
  {
    id: 'device-macbook',
    name: 'MacBook Pro',
    platform: 'macOS',
    device: 'Safari 17.4',
    user_agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'device-iphone',
    name: 'iPhone 15 Pro',
    platform: 'iOS',
    device: 'Fitness Pro',
    user_agent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const fallbackEvents = [
  {
    id: 'evt-01',
    kind: 'LOGIN',
    action: 'login',
    category: 'auth.session',
    note: 'Sessão iniciada via app iOS',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    details: { device: 'iPhone 15 Pro' },
  },
  {
    id: 'evt-02',
    kind: 'PROFILE_UPDATE',
    action: 'profile_update',
    category: 'profile.account',
    note: 'Bio actualizada com novos objectivos.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-03',
    kind: 'PASSWORD_CHANGE',
    action: 'password_change',
    category: 'auth.security',
    note: 'Palavra-passe revista por iniciativa do utilizador.',
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getProfileDashboardFallback(
  overrides: Partial<ProfileAccount> = {},
): ProfileDashboardData {
  const account: ProfileAccount = { ...fallbackAccount, ...overrides };
  return buildProfileDashboard(
    {
      account,
      sessions: getFallbackClientSessions(),
      requests: getFallbackSessionRequests(),
      notifications: fallbackNotifications,
      devices: fallbackDevices,
      events: fallbackEvents,
    },
    { now: new Date() },
  );
}
