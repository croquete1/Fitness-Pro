export type FallbackUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  approved: boolean;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
  last_seen_at: string | null;
  online: boolean;
};

const BASE_USERS: FallbackUser[] = [
  {
    id: '1001',
    name: 'Ana Marques',
    email: 'ana.marques@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    online: true,
  },
  {
    id: '1002',
    name: 'João Pires',
    email: 'joao.pt@example.com',
    role: 'TRAINER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    online: false,
  },
  {
    id: '1003',
    name: 'Maria Costa',
    email: 'maria.costa@example.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(),
    online: false,
  },
  {
    id: '1004',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@example.com',
    role: 'TRAINER',
    status: 'PENDING',
    approved: false,
    active: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    last_login_at: null,
    last_seen_at: null,
    online: false,
  },
  {
    id: '1005',
    name: 'Rita Figueiredo',
    email: 'rita.figueiredo@example.com',
    role: 'CLIENT',
    status: 'SUSPENDED',
    approved: true,
    active: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    online: false,
  },
  {
    id: '1006',
    name: 'Diogo Rocha',
    email: 'diogo.rocha@example.com',
    role: 'TRAINER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    online: true,
  },
  {
    id: '1007',
    name: 'Sara Nogueira',
    email: 'sara.nogueira@example.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    online: false,
  },
  {
    id: '1008',
    name: 'Miguel Tavares',
    email: 'miguel.tavares@example.com',
    role: 'TRAINER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    online: false,
  },
  {
    id: '1009',
    name: 'Helena Duarte',
    email: 'helena.duarte@example.com',
    role: 'CLIENT',
    status: 'PENDING',
    approved: false,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    last_login_at: null,
    last_seen_at: null,
    online: false,
  },
  {
    id: '1010',
    name: 'Ricardo Fonseca',
    email: 'ricardo.fonseca@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    approved: true,
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
    last_login_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    last_seen_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    online: false,
  },
];

type SampleSession = {
  id: string;
  trainer_id: string;
  client_id: string;
  start_time: string;
  location?: string | null;
};

const SAMPLE_SESSIONS: SampleSession[] = (() => {
  const now = Date.now();
  const hours = (h: number) => new Date(now + h * 3600_000).toISOString();
  const combos: Array<{ trainer: string; client: string; hours: number; location: string }> = [
    { trainer: '1002', client: '1003', hours: 3, location: 'Estúdio Norte' },
    { trainer: '1006', client: '1007', hours: 7, location: 'Sala Funcional' },
    { trainer: '1008', client: '1009', hours: 11, location: 'Box HIIT' },
    { trainer: '1002', client: '1005', hours: 26, location: 'Estúdio Norte' },
    { trainer: '1006', client: '1003', hours: 32, location: 'Outdoor Parque' },
    { trainer: '1008', client: '1007', hours: 40, location: 'Sala Cardio' },
  ];
  return combos.map((item, index) => ({
    id: `sample-session-${index + 1}`,
    trainer_id: item.trainer,
    client_id: item.client,
    start_time: hours(item.hours),
    location: item.location,
  }));
})();

const USER_LOOKUP = new Map(BASE_USERS.map((user) => [user.id, user] as const));

function safeName(id?: string | null) {
  if (!id) return '—';
  const user = USER_LOOKUP.get(id);
  return user?.name ?? user?.email ?? id;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export type SampleAdminDashboard = {
  totals: {
    users: number;
    clients: number;
    trainers: number;
    sessionsToday: number;
    pendingApprovals: number;
  };
  recentUsers: Array<{ id: string; name: string; email: string | null; createdAt: string | null }>;
  topTrainers: Array<{ id: string; name: string; total: number }>;
  agenda: Array<{
    id: string;
    start_time: string;
    trainer_id: string;
    trainer_name: string;
    client_id: string;
    client_name: string;
    location?: string | null;
  }>;
};

export function getSampleAdminDashboard(): SampleAdminDashboard {
  const totals = {
    users: BASE_USERS.length,
    clients: BASE_USERS.filter((u) => u.role === 'CLIENT').length,
    trainers: BASE_USERS.filter((u) => u.role === 'TRAINER').length,
    sessionsToday: 0,
    pendingApprovals: BASE_USERS.filter((u) => u.status !== 'ACTIVE' || !u.approved).length,
  };

  const agenda = SAMPLE_SESSIONS
    .map((session) => ({
      ...session,
      trainer_name: safeName(session.trainer_id),
      client_name: safeName(session.client_id),
    }))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  totals.sessionsToday = agenda.filter((session) => isSameDay(new Date(session.start_time), new Date())).length;

  const trainerTotals = new Map<string, number>();
  for (const session of agenda) {
    trainerTotals.set(session.trainer_id, (trainerTotals.get(session.trainer_id) ?? 0) + 1);
  }

  const topTrainers = Array.from(trainerTotals.entries())
    .map(([id, total]) => ({ id, total, name: safeName(id) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentUsers = [...BASE_USERS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.email ?? 'Utilizador',
      email: u.email ?? null,
      createdAt: u.created_at ?? null,
    }));

  return { totals, recentUsers, topTrainers, agenda };
}

const SAMPLE_TRAINER_CLIENTS: Record<string, string[]> = {
  '1002': ['1003', '1005'],
  '1006': ['1007', '1003'],
  '1008': ['1007', '1009'],
};

export type SampleTrainerDashboard = {
  trainerId: string;
  clients: Array<{ id: string; name: string }>;
  stats: {
    totalClients: number;
    activePlans: number;
    sessionsThisWeek: number;
    pendingRequests: number;
  };
  upcoming: SampleAdminDashboard['agenda'];
};

export function getSampleTrainerDashboard(trainerId: string): SampleTrainerDashboard {
  const mappedClients = SAMPLE_TRAINER_CLIENTS[trainerId] ?? Array.from(USER_LOOKUP.keys()).filter((id) => USER_LOOKUP.get(id)?.role === 'CLIENT').slice(0, 3);
  const clients = mappedClients.map((id) => ({ id, name: safeName(id) }));
  const upcoming = SAMPLE_SESSIONS
    .filter((session) => session.trainer_id === trainerId)
    .map((session) => ({
      ...session,
      trainer_name: safeName(session.trainer_id),
      client_name: safeName(session.client_id),
    }))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return {
    trainerId,
    clients,
    stats: {
      totalClients: clients.length,
      activePlans: Math.max(2, clients.length),
      sessionsThisWeek: upcoming.length,
      pendingRequests: Math.max(0, 3 - clients.length),
    },
    upcoming,
  };
}

export type SampleQuery = {
  page: number;
  pageSize: number;
  search?: string;
  role?: string | null;
  status?: string | null;
};

export function getSampleUsers({ page, pageSize, search, role, status }: SampleQuery) {
  const normalisedSearch = search?.trim().toLowerCase();
  const filtered = BASE_USERS.filter((user) => {
    if (role && user.role !== role.toUpperCase()) return false;
    if (status && user.status !== status.toUpperCase()) return false;
    if (!normalisedSearch) return true;
    return [user.name, user.email, user.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalisedSearch));
  });

  const start = Math.max(page, 0) * pageSize;
  const end = start + pageSize;
  const rows = filtered.slice(start, end);

  return {
    rows,
    count: filtered.length,
  };
}

type SampleApproval = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string | null;
};

const SAMPLE_APPROVALS: SampleApproval[] = BASE_USERS.filter((user) => !user.approved || user.status !== 'ACTIVE').map(
  (user, index) => ({
    id: `approval-${index + 1}`,
    user_id: user.id,
    name: user.name,
    email: user.email,
    status: !user.approved || user.status === 'PENDING'
      ? 'pending'
      : user.status === 'SUSPENDED'
        ? 'rejected'
        : 'approved',
    requested_at: user.created_at ?? null,
  }),
);

export type SampleApprovalsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string | null;
};

export function getSampleApprovals({ page, pageSize, search, status }: SampleApprovalsQuery) {
  const normalisedSearch = search?.trim().toLowerCase();
  const filtered = SAMPLE_APPROVALS.filter((item) => {
    if (status && item.status !== status.toLowerCase()) return false;
    if (!normalisedSearch) return true;
    return [item.name, item.email, item.user_id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalisedSearch));
  });

  const start = Math.max(page, 0) * pageSize;
  const end = start + pageSize;
  const rows = filtered.slice(start, end);

  return {
    rows,
    count: filtered.length,
  };
}

export type SampleSearchPayload = {
  users: Array<{ id: string; name: string; role: string; email: string | null }>;
  sessions: Array<{ id: string; when: string; trainer: string; client: string; location: string | null }>;
  approvals: Array<{ id: string; name: string | null; email: string | null; status: string }>;
};

export function searchFallbackDataset(term: string): SampleSearchPayload {
  const query = term.trim().toLowerCase();
  if (!query) {
    return { users: [], sessions: [], approvals: [] };
  }

  const users = BASE_USERS.filter((user) =>
    [user.name, user.email, user.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
    .slice(0, 10)
    .map((user) => ({
      id: user.id,
      name: user.name ?? user.email ?? user.id,
      role: user.role,
      email: user.email ?? null,
    }));

  const sessions = SAMPLE_SESSIONS.filter((session) => {
    const trainer = safeName(session.trainer_id).toLowerCase();
    const client = safeName(session.client_id).toLowerCase();
    const location = session.location?.toLowerCase() ?? '';
    return (
      trainer.includes(query) ||
      client.includes(query) ||
      location.includes(query) ||
      session.id.toLowerCase().includes(query)
    );
  })
    .slice(0, 8)
    .map((session) => ({
      id: session.id,
      when: session.start_time,
      trainer: safeName(session.trainer_id),
      client: safeName(session.client_id),
      location: session.location ?? null,
    }));

  const approvals = SAMPLE_APPROVALS.filter((approval) =>
    [approval.name, approval.email, approval.user_id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
    .slice(0, 6)
    .map((approval) => ({
      id: approval.id,
      name: approval.name ?? safeName(approval.user_id),
      email: approval.email ?? null,
      status: approval.status,
    }));

  return { users, sessions, approvals };
}
