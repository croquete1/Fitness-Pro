// src/lib/questionnaire.ts
import { toAppRole } from '@/lib/roles';
import type { Database } from '@/types/supabase';

export type FitnessQuestionnaireRow = Database['public']['Tables']['fitness_questionnaire']['Row'];

export type QuestionnaireStatus = 'draft' | 'submitted';

export type QuestionnaireWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const QUESTIONNAIRE_WEEK_DAYS: QuestionnaireWeekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const QUESTIONNAIRE_WEEKDAY_LABEL: Record<QuestionnaireWeekday, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export type QuestionnaireAnamnesis = {
  cardiac: string;
  familyHistory: string;
  hypertension: string;
  respiratory: string;
  diabetes: string;
  cholesterol: string;
  other: string;
  smokeDrink: string;
  recentSurgery: string;
  medication: string;
};

export type QuestionnaireScheduleState = {
  days: Record<QuestionnaireWeekday, boolean>;
  notes: string;
};

export type QuestionnaireSchedulePayload = {
  days: Record<QuestionnaireWeekday, boolean>;
  notes: string | null;
};

export type QuestionnaireBodyMetrics = {
  height: string;
  bodyWeight: string;
  bodyFat: string;
  leanMass: string;
  bmi: string;
  metabolicAge: string;
  basalMetabolism: string;
  waterPercent: string;
  visceralFat: string;
  bloodPressure: string;
};

export type QuestionnairePerimeters = {
  shoulder: string;
  bicep: string;
  chest: string;
  waist: string;
  hip: string;
  glute: string;
  thigh: string;
};

export type QuestionnaireBodyMetricsPayload = {
  [Key in keyof QuestionnaireBodyMetrics]: string | null;
};

export type QuestionnaireMetricsState = {
  body: QuestionnaireBodyMetrics;
  perimeters: QuestionnairePerimeters;
  notes: string;
  observations: string;
};

export type QuestionnairePerimetersPayload = {
  [Key in keyof QuestionnairePerimeters]: string | null;
};

export type QuestionnaireMetricsPayload = {
  body: QuestionnaireBodyMetricsPayload;
  perimeters: QuestionnairePerimetersPayload;
  notes: string | null;
  observations: string | null;
  anamnesis: QuestionnaireAnamnesis;
};

export type QuestionnaireExerciseState = {
  practice: boolean;
  sport: string;
  duration: string;
};

export type QuestionnaireFormState = {
  job: string;
  activityLevel: 'active' | 'sedentary';
  exercise: QuestionnaireExerciseState;
  objective: string;
  wellbeing: number | null;
  anamnesis: QuestionnaireAnamnesis;
  schedule: QuestionnaireScheduleState;
  metrics: QuestionnaireMetricsState;
};

export type QuestionnaireNormalized = {
  status: QuestionnaireStatus;
  job: string | null;
  activity: 'Ativo' | 'Sedentário';
  exercise: { practice: boolean; sport: string | null; duration: string | null };
  objective: string | null;
  wellbeing: number | null;
  anamnesis: QuestionnaireAnamnesis;
  schedule: { days: QuestionnaireWeekday[]; notes: string | null };
  metrics: {
    body: Partial<QuestionnaireBodyMetrics>;
    perimeters: Partial<QuestionnairePerimeters>;
    notes: string | null;
    observations: string | null;
  };
  summary: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

type JsonLike = unknown;

type QuestionnaireRowLike = Partial<FitnessQuestionnaireRow> & {
  schedule?: JsonLike | null;
  metrics?: JsonLike | null;
};

const EMPTY_ANAMNESIS: QuestionnaireAnamnesis = {
  cardiac: '',
  familyHistory: '',
  hypertension: '',
  respiratory: '',
  diabetes: '',
  cholesterol: '',
  other: '',
  smokeDrink: '',
  recentSurgery: '',
  medication: '',
};

const EMPTY_BODY: QuestionnaireBodyMetrics = {
  height: '',
  bodyWeight: '',
  bodyFat: '',
  leanMass: '',
  bmi: '',
  metabolicAge: '',
  basalMetabolism: '',
  waterPercent: '',
  visceralFat: '',
  bloodPressure: '',
};

const EMPTY_PERIMETERS: QuestionnairePerimeters = {
  shoulder: '',
  bicep: '',
  chest: '',
  waist: '',
  hip: '',
  glute: '',
  thigh: '',
};

const EMPTY_SCHEDULE: QuestionnaireScheduleState = {
  days: QUESTIONNAIRE_WEEK_DAYS.reduce(
    (acc, day) => {
      acc[day] = false;
      return acc;
    },
    {} as Record<QuestionnaireWeekday, boolean>,
  ),
  notes: '',
};

const EMPTY_METRICS: QuestionnaireMetricsState = {
  body: { ...EMPTY_BODY },
  perimeters: { ...EMPTY_PERIMETERS },
  notes: '',
  observations: '',
};

const EMPTY_EXERCISE: QuestionnaireExerciseState = {
  practice: false,
  sport: '',
  duration: '',
};

function isJsonRecord(value: JsonLike): value is Record<string, JsonLike> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildFormState(initial: QuestionnaireRowLike | null): QuestionnaireFormState {
  const job = typeof initial?.job === 'string' ? initial.job : '';
  const activityLevel: 'active' | 'sedentary' = initial?.active ? 'active' : 'sedentary';
  const practice = Boolean(initial?.sport || initial?.sport_time);
  const sport = typeof initial?.sport === 'string' ? initial.sport : '';
  const duration = typeof initial?.sport_time === 'string' ? initial.sport_time : '';
  const objective = typeof initial?.objective === 'string' ? initial.objective : '';
  const wellbeing = typeof initial?.wellbeing_0_to_5 === 'number' ? clampRating(initial.wellbeing_0_to_5) : null;

  let schedule: QuestionnaireScheduleState = { ...EMPTY_SCHEDULE, days: { ...EMPTY_SCHEDULE.days } };
  if (isJsonRecord(initial?.schedule)) {
    const notes = typeof initial?.schedule?.notes === 'string' ? initial.schedule.notes : '';
    const daysRaw = isJsonRecord(initial?.schedule?.days) ? (initial.schedule.days as Record<string, JsonLike>) : {};
    const days = { ...EMPTY_SCHEDULE.days };
    for (const day of QUESTIONNAIRE_WEEK_DAYS) {
      days[day] = Boolean(daysRaw[day]);
    }
    schedule = { days, notes };
  }

  let metrics: QuestionnaireMetricsState = {
    body: { ...EMPTY_BODY },
    perimeters: { ...EMPTY_PERIMETERS },
    notes: '',
    observations: '',
  };

  let anamnesis: QuestionnaireAnamnesis = { ...EMPTY_ANAMNESIS };

  if (isJsonRecord(initial?.metrics)) {
    const record = initial.metrics as Record<string, JsonLike>;
    if (isJsonRecord(record.body)) {
      const bodyRaw = record.body as Record<string, JsonLike>;
      metrics.body = Object.keys(EMPTY_BODY).reduce((acc, key) => {
        const value = bodyRaw[key];
        acc[key as keyof QuestionnaireBodyMetrics] = typeof value === 'string' ? value : '';
        return acc;
      },
      { ...EMPTY_BODY });
    }
    if (isJsonRecord(record.perimeters)) {
      const perimetersRaw = record.perimeters as Record<string, JsonLike>;
      metrics.perimeters = Object.keys(EMPTY_PERIMETERS).reduce((acc, key) => {
        const value = perimetersRaw[key];
        acc[key as keyof QuestionnairePerimeters] = typeof value === 'string' ? value : '';
        return acc;
      },
      { ...EMPTY_PERIMETERS });
    }
    metrics.notes = typeof record.notes === 'string' ? record.notes : '';
    metrics.observations = typeof record.observations === 'string' ? record.observations : '';
    if (isJsonRecord(record.anamnesis)) {
      const anaRaw = record.anamnesis as Record<string, JsonLike>;
      anamnesis = { ...EMPTY_ANAMNESIS };
      for (const key of Object.keys(anamnesis) as (keyof QuestionnaireAnamnesis)[]) {
        const value = anaRaw[key];
        anamnesis[key] = typeof value === 'string' ? value : '';
      }
    }
  }

  // Fallback: try to parse pathologies string if anamnesis empty
  if (!hasAnyValue(anamnesis) && typeof initial?.pathologies === 'string') {
    const segments = initial.pathologies.split(/;|\n/).map((segment) => segment.trim()).filter(Boolean);
    const keys = Object.keys(anamnesis) as (keyof QuestionnaireAnamnesis)[];
    segments.forEach((segment, index) => {
      const key = keys[index];
      if (key) anamnesis[key] = segment;
    });
  }

  if (!hasAnyValue(anamnesis)) {
    anamnesis = { ...EMPTY_ANAMNESIS };
  }

  return {
    job,
    activityLevel,
    exercise: { practice, sport, duration },
    objective,
    wellbeing,
    anamnesis,
    schedule,
    metrics,
  };
}

function hasAnyValue(record: QuestionnaireAnamnesis) {
  return Object.values(record).some((value) => Boolean(value && value.trim()));
}

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 5) return 5;
  return Math.round(value);
}

function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeOptionalText(value: unknown): string | null {
  const trimmed = sanitizeText(value);
  return trimmed ? trimmed : null;
}

function sanitizeRating(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return clampRating(num);
}

function sanitizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'sim') return true;
  }
  if (typeof value === 'number') return value !== 0;
  return false;
}

function sanitizeSchedule(input: any): QuestionnaireScheduleState {
  const base = { days: { ...EMPTY_SCHEDULE.days }, notes: '' };
  if (!isJsonRecord(input)) return base;
  const notes = sanitizeText(input.notes);
  const daysInput = isJsonRecord(input.days) ? (input.days as Record<string, JsonLike>) : {};
  const days: Record<QuestionnaireWeekday, boolean> = { ...EMPTY_SCHEDULE.days };
  for (const day of QUESTIONNAIRE_WEEK_DAYS) {
    days[day] = Boolean(daysInput[day]);
  }
  return { days, notes };
}

function sanitizeBodyMetrics(input: any): QuestionnaireBodyMetrics {
  const base = { ...EMPTY_BODY };
  if (!isJsonRecord(input)) return base;
  for (const key of Object.keys(base) as (keyof QuestionnaireBodyMetrics)[]) {
    base[key] = sanitizeText(input[key]);
  }
  return base;
}

function sanitizePerimeters(input: any): QuestionnairePerimeters {
  const base = { ...EMPTY_PERIMETERS };
  if (!isJsonRecord(input)) return base;
  for (const key of Object.keys(base) as (keyof QuestionnairePerimeters)[]) {
    base[key] = sanitizeText(input[key]);
  }
  return base;
}

function sanitizeAnamnesis(input: any): QuestionnaireAnamnesis {
  const base = { ...EMPTY_ANAMNESIS };
  if (!isJsonRecord(input)) return base;
  for (const key of Object.keys(base) as (keyof QuestionnaireAnamnesis)[]) {
    base[key] = sanitizeText(input[key]);
  }
  return base;
}

function mapEmptyToNull<T extends Record<string, string>>(input: T): { [Key in keyof T]: string | null } {
  return (Object.keys(input) as (keyof T)[]).reduce((acc, key) => {
    const value = sanitizeOptionalText(input[key]);
    acc[key] = value;
    return acc;
  }, {} as { [Key in keyof T]: string | null });
}

function buildAnamnesisSummary(anamnesis: QuestionnaireAnamnesis): string | null {
  const labels: Record<keyof QuestionnaireAnamnesis, string> = {
    cardiac: 'Patologias cardíacas',
    familyHistory: 'Histórico familiar',
    hypertension: 'Hipertensão',
    respiratory: 'Patologias respiratórias',
    diabetes: 'Diabetes',
    cholesterol: 'Colesterol',
    other: 'Outras patologias',
    smokeDrink: 'Fuma/bebe',
    recentSurgery: 'Cirurgias recentes',
    medication: 'Medicação',
  };
  const entries = (Object.keys(anamnesis) as (keyof QuestionnaireAnamnesis)[])
    .map((key) => {
      const value = sanitizeText(anamnesis[key]);
      if (!value) return null;
      return `${labels[key]}: ${value}`;
    })
    .filter((entry): entry is string => Boolean(entry));
  if (!entries.length) return null;
  return entries.join('; ');
}

export type QuestionnaireUpsertPayload = {
  job: string | null;
  active: boolean;
  sport: string | null;
  sport_time: string | null;
  objective: string | null;
  wellbeing_0_to_5: number | null;
  schedule: QuestionnaireSchedulePayload;
  metrics: QuestionnaireMetricsPayload;
  pathologies: string | null;
  status: QuestionnaireStatus;
};

export function serializeQuestionnaireForm(
  form: QuestionnaireFormState,
  { status = 'submitted' }: { status?: QuestionnaireStatus } = {},
): QuestionnaireUpsertPayload {
  const anamnesis = sanitizeAnamnesis(form.anamnesis);
  const scheduleSanitized = sanitizeSchedule(form.schedule);
  const scheduleNotes = sanitizeOptionalText(scheduleSanitized.notes);
  const metricsBody = sanitizeBodyMetrics(form.metrics.body);
  const perimeters = sanitizePerimeters(form.metrics.perimeters);
  const metricsNotes = sanitizeOptionalText(form.metrics.notes);
  const observations = sanitizeOptionalText(form.metrics.observations);

  return {
    job: sanitizeOptionalText(form.job),
    active: form.activityLevel === 'active',
    sport: form.exercise.practice ? sanitizeOptionalText(form.exercise.sport) : null,
    sport_time: form.exercise.practice ? sanitizeOptionalText(form.exercise.duration) : null,
    objective: sanitizeOptionalText(form.objective),
    wellbeing_0_to_5: sanitizeRating(form.wellbeing),
    schedule: {
      days: scheduleSanitized.days,
      notes: scheduleNotes,
    },
    metrics: {
      body: mapEmptyToNull(metricsBody),
      perimeters: mapEmptyToNull(perimeters),
      notes: metricsNotes,
      observations,
      anamnesis,
    },
    pathologies: buildAnamnesisSummary(anamnesis),
    status,
  };
}

export function normalizeQuestionnaireInput(input: any): QuestionnaireUpsertPayload {
  const activityLevel = sanitizeBoolean(input?.active);
  const practice = sanitizeBoolean(input?.exercise?.practice ?? (activityLevel ? input?.sport : false));
  const form: QuestionnaireFormState = {
    job: sanitizeText(input?.job),
    activityLevel: activityLevel ? 'active' : 'sedentary',
    exercise: {
      practice,
      sport: sanitizeText(input?.sport ?? input?.exercise?.sport),
      duration: sanitizeText(input?.sport_time ?? input?.exercise?.duration),
    },
    objective: sanitizeText(input?.objective),
    wellbeing: sanitizeRating(input?.wellbeing_0_to_5 ?? input?.wellbeing),
    anamnesis: sanitizeAnamnesis(input?.anamnesis ?? input?.metrics?.anamnesis),
    schedule: sanitizeSchedule(input?.schedule),
    metrics: {
      body: sanitizeBodyMetrics(input?.metrics?.body),
      perimeters: sanitizePerimeters(input?.metrics?.perimeters),
      notes: sanitizeText(input?.metrics?.notes ?? input?.notes ?? ''),
      observations: sanitizeText(input?.metrics?.observations ?? input?.observations ?? ''),
    },
  };

  const payload = serializeQuestionnaireForm(form, {
    status: input?.status === 'draft' ? 'draft' : 'submitted',
  });

  // Notas e observações já normalizadas como string; garantir que null é respeitado
  payload.metrics.notes = sanitizeOptionalText(form.metrics.notes);
  payload.metrics.observations = sanitizeOptionalText(form.metrics.observations);
  return payload;
}

export function normalizeQuestionnaire(row: QuestionnaireRowLike | null): QuestionnaireNormalized | null {
  if (!row) return null;
  const status: QuestionnaireStatus = row.status === 'submitted' ? 'submitted' : 'draft';
  const form = buildFormState(row);
  const payload = serializeQuestionnaireForm(form, { status });

  return {
    status,
    job: payload.job,
    activity: payload.active ? 'Ativo' : 'Sedentário',
    exercise: {
      practice: form.exercise.practice,
      sport: payload.sport,
      duration: payload.sport_time,
    },
    objective: payload.objective,
    wellbeing: payload.wellbeing_0_to_5,
    anamnesis: payload.metrics.anamnesis,
    schedule: {
      days: QUESTIONNAIRE_WEEK_DAYS.filter((day) => payload.schedule.days[day]),
      notes: payload.schedule.notes ? payload.schedule.notes : null,
    },
    metrics: {
      body: payload.metrics.body,
      perimeters: payload.metrics.perimeters,
      notes: payload.metrics.notes ?? null,
      observations: payload.metrics.observations ?? null,
    },
    summary: payload.pathologies,
    updatedAt: row.updated_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

export function validateQuestionnairePayload(payload: QuestionnaireUpsertPayload): string[] {
  const errors: string[] = [];
  if (!payload.job) {
    errors.push('Indica a tua atividade profissional.');
  }
  if (!payload.objective) {
    errors.push('Define um objetivo principal para o plano.');
  }
  if (payload.wellbeing_0_to_5 === null) {
    errors.push('Seleciona como avalias o teu bem-estar (0 a 5).');
  }
  const hasDays = QUESTIONNAIRE_WEEK_DAYS.some((day) => payload.schedule.days[day]);
  if (!hasDays) {
    errors.push('Escolhe pelo menos um dia preferencial para treinar.');
  }
  return errors;
}

export function canAdministerQuestionnaire(role: unknown): boolean {
  const appRole = toAppRole(role);
  return appRole === 'ADMIN';
}

