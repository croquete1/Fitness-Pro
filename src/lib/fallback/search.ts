import { buildSearchDashboard } from '@/lib/search/dashboard';
import type {
  SearchDashboardData,
  SearchResultRecord,
  SearchResultType,
  SearchCollectionInput,
} from '@/lib/search/types';
import { getSampleUsers } from '@/lib/fallback/users';
import { getClientPlansRowsFallback } from '@/lib/fallback/plans';
import { getFallbackClientSessions } from '@/lib/fallback/sessions';

const LIMIT = 24;

const EXERCISES_FALLBACK: Array<{
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  createdAt: string;
  updatedAt: string;
}> = (() => {
  const now = Date.now();
  const days = (value: number) => new Date(now - value * 86_400_000).toISOString();
  return [
    {
      id: 'exercise-neo-01',
      name: 'Agachamento frontal com kettlebell',
      muscleGroup: 'Quadríceps',
      equipment: 'Kettlebell',
      createdAt: days(52),
      updatedAt: days(3),
    },
    {
      id: 'exercise-neo-02',
      name: 'Remada unilateral com halter',
      muscleGroup: 'Dorsais',
      equipment: 'Halteres',
      createdAt: days(74),
      updatedAt: days(12),
    },
    {
      id: 'exercise-neo-03',
      name: 'Prancha lateral com elevação',
      muscleGroup: 'Core',
      equipment: 'Peso corporal',
      createdAt: days(38),
      updatedAt: days(6),
    },
    {
      id: 'exercise-neo-04',
      name: 'Swing com kettlebell',
      muscleGroup: 'Posterior de coxa',
      equipment: 'Kettlebell',
      createdAt: days(120),
      updatedAt: days(30),
    },
    {
      id: 'exercise-neo-05',
      name: 'Pistol squat assistido',
      muscleGroup: 'Glúteos',
      equipment: 'TRX',
      createdAt: days(18),
      updatedAt: days(1),
    },
    {
      id: 'exercise-neo-06',
      name: 'Sprint intervalado em assault bike',
      muscleGroup: 'Cardio',
      equipment: 'Assault bike',
      createdAt: days(90),
      updatedAt: days(8),
    },
    {
      id: 'exercise-neo-07',
      name: 'Farmers walk',
      muscleGroup: 'Trapézio',
      equipment: 'Halteres',
      createdAt: days(140),
      updatedAt: days(25),
    },
    {
      id: 'exercise-neo-08',
      name: 'Box jump com aterragem controlada',
      muscleGroup: 'Explosão',
      equipment: 'Caixa pliométrica',
      createdAt: days(44),
      updatedAt: days(4),
    },
    {
      id: 'exercise-neo-09',
      name: 'Remo invertido em anilhas',
      muscleGroup: 'Costas',
      equipment: 'Anilhas suspensas',
      createdAt: days(61),
      updatedAt: days(10),
    },
    {
      id: 'exercise-neo-10',
      name: 'Progresso de handstand na parede',
      muscleGroup: 'Ombros',
      equipment: 'Peso corporal',
      createdAt: days(28),
      updatedAt: days(2),
    },
  ];
})();

function normaliseRecords(records: SearchResultRecord[], query: string): SearchResultRecord[] {
  if (!query.trim()) {
    return records;
  }
  const normalized = query.toLowerCase();
  return records.filter((record) =>
    record.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)),
  );
}

function sortRecords(records: SearchResultRecord[]): SearchResultRecord[] {
  return records
    .slice()
    .sort((a, b) => {
      const aDate = a.updatedAt ?? a.createdAt ?? '';
      const bDate = b.updatedAt ?? b.createdAt ?? '';
      if (aDate && bDate) return bDate.localeCompare(aDate);
      if (aDate) return -1;
      if (bDate) return 1;
      return a.title.localeCompare(b.title);
    });
}

export function getSearchDashboardFallback(opts: {
  query?: string;
  types?: SearchResultType[];
} = {}): SearchDashboardData {
  const query = opts.query?.trim() ?? '';
  const activeTypes: SearchResultType[] = opts.types?.length
    ? opts.types
    : ['users', 'plans', 'exercises', 'sessions'];

  const userRows = getSampleUsers({ page: 0, pageSize: 400 }).rows;
  const planRows = getClientPlansRowsFallback();
  const sessionRows = getFallbackClientSessions();

  const base: Record<SearchResultType, SearchResultRecord[]> = {
    users: userRows.map((row) => ({
      id: String(row.id),
      type: 'users',
      title: row.name ?? row.email ?? `Utilizador ${row.id}`,
      subtitle: [row.email, row.role].filter(Boolean).join(' • ') || null,
      href: `/dashboard/admin/users/${row.id}`,
      keywords: [
        row.name ?? '',
        row.email ?? '',
        row.role ?? '',
        String(row.id),
      ],
      createdAt: row.created_at ?? null,
      updatedAt: row.last_login_at ?? row.last_seen_at ?? row.created_at ?? null,
      badge: row.role
        ? {
            label:
              row.role === 'ADMIN'
                ? 'Administrador'
                : row.role === 'TRAINER'
                ? 'Treinador'
                : 'Cliente',
            tone: row.role === 'ADMIN' ? 'primary' : row.role === 'TRAINER' ? 'positive' : 'neutral',
          }
        : undefined,
      meta: row.status ? row.status.toString() : null,
    })),
    plans: planRows.map((plan) => ({
      id: plan.id,
      type: 'plans',
      title: plan.title,
      subtitle: [plan.trainerName, plan.trainerEmail].filter(Boolean).join(' • ') || null,
      href: `/dashboard/admin/plans/${plan.id}`,
      keywords: [plan.title, plan.trainerName ?? '', plan.trainerEmail ?? '', plan.status ?? ''],
      createdAt: plan.createdAt ?? null,
      updatedAt: plan.updatedAt ?? null,
      badge: plan.status
        ? {
            label: plan.status,
            tone: plan.status === 'ACTIVE' ? 'positive' : plan.status === 'ARCHIVED' ? 'neutral' : 'warning',
          }
        : undefined,
      meta: plan.startDate ? `Início ${new Date(plan.startDate).toLocaleDateString('pt-PT')}` : null,
    })),
    exercises: EXERCISES_FALLBACK.map((exercise) => ({
      id: exercise.id,
      type: 'exercises',
      title: exercise.name,
      subtitle: [exercise.muscleGroup, exercise.equipment].filter(Boolean).join(' • ') || null,
      href: `/dashboard/admin/exercises/${exercise.id}`,
      keywords: [
        exercise.name,
        exercise.muscleGroup ?? '',
        exercise.equipment ?? '',
        exercise.id,
      ],
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      badge: exercise.muscleGroup
        ? {
            label: exercise.muscleGroup,
            tone: 'neutral',
          }
        : undefined,
      meta: exercise.updatedAt
        ? `Actualizado ${new Date(exercise.updatedAt).toLocaleDateString('pt-PT')}`
        : null,
    })),
    sessions: sessionRows.map((session) => {
      const dateLabel = session.startISO
        ? new Date(session.startISO).toLocaleString('pt-PT', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;
      return {
        id: session.id,
        type: 'sessions',
        title: session.trainerName ? `Sessão com ${session.trainerName}` : 'Sessão agendada',
        subtitle: [dateLabel, session.location].filter(Boolean).join(' • ') || null,
        href: `/dashboard/admin/sessions/${session.id}`,
        keywords: [
          session.trainerName ?? '',
          session.trainerEmail ?? '',
          session.location ?? '',
          session.id,
        ],
        createdAt: session.startISO ?? null,
        updatedAt: session.attendanceAt ?? session.startISO ?? null,
        badge: session.status
          ? {
              label: String(session.status).toLowerCase(),
              tone:
                session.status === 'completed'
                  ? 'positive'
                  : session.status === 'cancelled'
                  ? 'warning'
                  : 'neutral',
            }
          : undefined,
        meta: session.location ?? null,
      } satisfies SearchResultRecord;
    }),
  };

  const collections: SearchCollectionInput[] = activeTypes.map((type) => {
    const filtered = sortRecords(normaliseRecords(base[type], query));
    return {
      type,
      label: undefined,
      total: filtered.length,
      offset: 0,
      limit: LIMIT,
      rows: filtered.slice(0, LIMIT),
    } satisfies SearchCollectionInput;
  });

  const suggestions = ['Ana Marques', 'Plano Premium PT', 'Swing kettlebell', 'Box HIIT'];

  const trends = [
    { term: 'Planos activos', count: 12, lastSearchedAt: new Date().toISOString() },
    { term: 'Sessões HIIT', count: 8, lastSearchedAt: new Date(Date.now() - 3600_000).toISOString() },
    { term: 'Avaliação física', count: 6, lastSearchedAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  ];

  return buildSearchDashboard({
    query,
    collections,
    suggestions,
    trending: trends,
    fallback: true,
    now: new Date(),
  }) as SearchDashboardData;
}
