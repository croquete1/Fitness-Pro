import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { PlanFeedbackDashboard, PlanFeedbackEntry, PlanFeedbackScope } from './types';
import { getPlanFeedbackFallback } from '@/lib/fallback/planFeedback';

type Client = SupabaseClient<Database>;

const TEXT_FIELDS = ['comment', 'notes', 'content', 'body', 'message', 'feedback'];
const TITLE_FIELDS = ['plan_title', 'planTitle', 'title', 'plan'];
const DAY_FIELDS = ['day_label', 'day_title', 'dayName', 'day'];
const DAY_INDEX_FIELDS = ['day_index', 'dayIndex', 'weekday'];
const EXERCISE_FIELDS = ['exercise_label', 'exercise_name', 'exercise', 'item'];

function safeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function extractText(record: Record<string, any>): string {
  for (const field of TEXT_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  if (typeof record.metadata === 'object' && record.metadata !== null) {
    const meta = record.metadata as Record<string, any>;
    for (const field of TEXT_FIELDS) {
      const value = meta[field];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }
  return 'Sem comentários registados.';
}

function extractTitle(record: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function extractPlanTitle(record: Record<string, any>): string | null {
  const explicit = extractTitle(record, TITLE_FIELDS);
  if (explicit) return explicit;
  if (typeof record.plan === 'object' && record.plan !== null) {
    return extractTitle(record.plan as Record<string, any>, ['title', 'name']);
  }
  return null;
}

function extractTargetLabel(scope: PlanFeedbackScope, record: Record<string, any>): string | null {
  if (scope === 'plan') {
    const section = extractTitle(record, ['section', 'phase', 'block']);
    return section ?? extractPlanTitle(record);
  }
  if (scope === 'days') {
    const label = extractTitle(record, DAY_FIELDS);
    if (label) return label;
    for (const field of DAY_INDEX_FIELDS) {
      const value = record[field];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `Dia ${value + 1}`;
      }
    }
    return 'Dia do plano';
  }
  const exercise = extractTitle(record, EXERCISE_FIELDS);
  if (exercise) return exercise;
  if (record.exercise?.name && typeof record.exercise.name === 'string') {
    return record.exercise.name;
  }
  return 'Exercício';
}

function normalizeMood(value: any): PlanFeedbackEntry['mood'] {
  if (typeof value === 'number') {
    if (value >= 4) return 'positive';
    if (value <= 2) return 'negative';
    return 'neutral';
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['positivo', 'positive', 'bom', 'boa', 'happy'].includes(normalized)) return 'positive';
    if (['negativo', 'negative', 'mau', 'bad'].includes(normalized)) return 'negative';
    if (['alerta', 'warn', 'warning'].includes(normalized)) return 'warning';
  }
  return 'neutral';
}

function mapRows(rows: any[], scope: PlanFeedbackScope): PlanFeedbackEntry[] {
  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const record = row as Record<string, any>;
      return {
        id: record.id ? String(record.id) : safeId(scope),
        scope,
        planId: record.plan_id ?? record.planId ?? record.training_plan_id ?? null,
        planTitle: extractPlanTitle(record),
        targetLabel: extractTargetLabel(scope, record),
        comment: extractText(record),
        createdAt: record.created_at ?? record.createdAt ?? record.inserted_at ?? null,
        mood: normalizeMood(record.mood ?? record.sentiment ?? record.score ?? null),
      } satisfies PlanFeedbackEntry;
    })
    .filter(Boolean) as PlanFeedbackEntry[];
}

async function fetchScope(
  sb: Client,
  table: string,
  clientId: string,
  scope: PlanFeedbackScope,
  limit: number,
): Promise<PlanFeedbackEntry[] | null> {
  try {
    const { data, error } = await sb
      .from(table as any)
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw error;
    return mapRows(data ?? [], scope);
  } catch (error) {
    console.warn(`[plan-feedback] falha ao carregar ${table}`, error);
    return null;
  }
}

export async function loadClientPlanFeedback(
  sb: Client,
  clientId: string,
  options?: { limit?: number; clientName?: string | null },
): Promise<PlanFeedbackDashboard> {
  const limit = options?.limit ?? 24;
  const [plan, days, exercises] = await Promise.all([
    fetchScope(sb, 'plan_feedback_entries', clientId, 'plan', limit),
    fetchScope(sb, 'plan_day_feedback', clientId, 'days', limit),
    fetchScope(sb, 'plan_exercise_feedback', clientId, 'exercises', limit),
  ]);

  if (!plan && !days && !exercises) {
    return getPlanFeedbackFallback(options?.clientName ?? null);
  }

  const fallback = getPlanFeedbackFallback(options?.clientName ?? null);
  return {
    source: 'supabase',
    updatedAt:
      plan?.[0]?.createdAt ?? days?.[0]?.createdAt ?? exercises?.[0]?.createdAt ?? fallback.updatedAt,
    plan: plan ?? fallback.plan,
    days: days ?? fallback.days,
    exercises: exercises ?? fallback.exercises,
  };
}
