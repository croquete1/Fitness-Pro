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
