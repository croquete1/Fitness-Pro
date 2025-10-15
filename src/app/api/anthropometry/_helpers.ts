// src/app/api/anthropometry/_helpers.ts
// Utilitários partilhados entre os endpoints de antropometria para manter
// compatibilidade com diferentes versões do esquema da tabela.

import { randomUUID } from 'node:crypto';
import type { PostgrestError, SupabaseClient as SbClient } from '@supabase/supabase-js';

type SupabaseClient = SbClient<any, any, any>;

export type AnthropometryApiRow = {
  id: string;
  client_id: string | null;
  user_id: string | null;
  measured_at: string | null;
  date: string | null; // alias para compatibilidade com UI existente
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  bmi: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  calf_cm: number | null;
  shoulders_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
  created_by_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AnthropometryInsertInput = {
  clientId: string;
  measuredAt: string;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  armCm: number | null;
  calfCm: number | null;
  shouldersCm: number | null;
  neckCm: number | null;
  bmi: number | null;
  notes: string | null;
  createdById?: string | null;
};

type SelectResult = {
  rows: AnthropometryApiRow[];
  error?: PostgrestError | null;
};

type InsertResult = {
  row?: AnthropometryApiRow;
  error?: PostgrestError | null;
};

const COLUMN_MISSING_CODE = '42703';

const ORDER_COMBINATIONS: Array<{ idColumn: 'user_id' | 'client_id'; orderColumn: 'measured_at' | 'date' | 'created_at' }>
  = [
    { idColumn: 'user_id', orderColumn: 'measured_at' },
    { idColumn: 'client_id', orderColumn: 'measured_at' },
    { idColumn: 'user_id', orderColumn: 'date' },
    { idColumn: 'client_id', orderColumn: 'date' },
    { idColumn: 'user_id', orderColumn: 'created_at' },
    { idColumn: 'client_id', orderColumn: 'created_at' },
  ];

const INSERT_ATTEMPTS: Array<{
  columns: Record<string, keyof AnthropometryInsertInput | 'clientId' | 'measuredAt' | 'createdById'>;
  rename?: Record<string, string>;
}> = [
  {
    columns: {
      user_id: 'clientId',
      measured_at: 'measuredAt',
      weight_kg: 'weightKg',
      height_cm: 'heightCm',
      body_fat_pct: 'bodyFatPct',
      chest_cm: 'chestCm',
      waist_cm: 'waistCm',
      hip_cm: 'hipCm',
      thigh_cm: 'thighCm',
      arm_cm: 'armCm',
      calf_cm: 'calfCm',
      shoulders_cm: 'shouldersCm',
      neck_cm: 'neckCm',
      bmi: 'bmi',
      notes: 'notes',
      created_by_id: 'createdById',
    },
  },
  {
    columns: {
      client_id: 'clientId',
      date: 'measuredAt',
      weight: 'weightKg',
      height: 'heightCm',
      body_fat_pct: 'bodyFatPct',
      notes: 'notes',
    },
  },
];

export async function selectAnthropometryRows(
  supabase: SupabaseClient,
  clientId: string,
  limit = 100,
): Promise<SelectResult> {
  for (const combo of ORDER_COMBINATIONS) {
    const query = supabase
      .from('anthropometry')
      .select('*')
      .eq(combo.idColumn, clientId)
      .order(combo.orderColumn, { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (!error) {
      return { rows: (data ?? []).map(mapRow) };
    }

    if (!isMissingColumn(error, combo.idColumn) && !isMissingColumn(error, combo.orderColumn)) {
      return { rows: [], error };
    }
  }

  return { rows: [] };
}

export async function insertAnthropometryRow(
  supabase: SupabaseClient,
  input: AnthropometryInsertInput,
): Promise<InsertResult> {
  const clean = sanitizeInput(input);

  let lastError: PostgrestError | null | undefined;

  for (const attempt of INSERT_ATTEMPTS) {
    const payload: Record<string, unknown> = {};
    const usedColumns: string[] = [];

    for (const [column, key] of Object.entries(attempt.columns)) {
      const value = (clean as Record<string, unknown>)[key as keyof AnthropometryInsertInput];
      if (value === undefined || value === null || value === '') continue;
      payload[column] = value;
      usedColumns.push(column);
    }

    if (!payload.user_id && !payload.client_id) {
      // garantia mínima: precisamos de um identificador
      payload.user_id = clean.clientId;
      usedColumns.push('user_id');
    }
    if (!payload.measured_at && !payload.date) {
      payload.measured_at = clean.measuredAt;
      usedColumns.push('measured_at');
    }

    const { data, error } = await supabase
      .from('anthropometry')
      .insert(payload)
      .select('*')
      .single();

    if (!error) {
      return { row: mapRow(data) };
    }

    lastError = error;

    const missing = usedColumns.some((col) => isMissingColumn(error, col));
    if (!missing) {
      return { error };
    }
  }

  return { error: lastError };
}

export function mapRow(row: Record<string, any>): AnthropometryApiRow {
  const userId = stringOrNull(row.user_id ?? row.client_id ?? null);
  const measuredAt = pickDate(row);
  const weightKg = numberOrNull(row.weight_kg ?? row.weight ?? row.weightkg);
  const heightCm = numberOrNull(row.height_cm ?? row.height ?? row.heightcm);
  const bodyFat = numberOrNull(row.body_fat_pct ?? row.bodyfat_pct ?? row.body_fat);
  const bmi = numberOrNull(row.bmi ?? calcBmi(weightKg, heightCm));

  return {
    id: stringOrNull(row.id) ?? randomUUID(),
    client_id: userId,
    user_id: userId,
    measured_at: measuredAt,
    date: measuredAt,
    weight_kg: weightKg,
    height_cm: heightCm,
    body_fat_pct: bodyFat,
    bmi,
    chest_cm: numberOrNull(row.chest_cm ?? row.chestcm),
    waist_cm: numberOrNull(row.waist_cm ?? row.waistcm),
    hip_cm: numberOrNull(row.hip_cm ?? row.hipcm),
    thigh_cm: numberOrNull(row.thigh_cm ?? row.thighcm),
    arm_cm: numberOrNull(row.arm_cm ?? row.armcm),
    calf_cm: numberOrNull(row.calf_cm ?? row.calfcm),
    shoulders_cm: numberOrNull(row.shoulders_cm ?? row.shoulderscm),
    neck_cm: numberOrNull(row.neck_cm ?? row.neckcm),
    notes: stringOrNull(row.notes),
    created_by_id: stringOrNull(row.created_by_id ?? row.trainer_id ?? row.createdby_id),
    created_at: isoOrNull(row.created_at ?? row.inserted_at ?? measuredAt),
    updated_at: isoOrNull(row.updated_at ?? row.modified_at ?? row.created_at ?? measuredAt),
  };
}

export function normalizeDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    // tenta interpretar YYYY-MM-DD manualmente
    const match = /^\d{4}-\d{2}-\d{2}$/.exec(value.trim());
    if (match) {
      return new Date(`${value}T00:00:00.000Z`).toISOString();
    }
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

export function toNullableNumber(value: unknown): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const num = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  return Number.isFinite(num) ? num : null;
}

function sanitizeInput(input: AnthropometryInsertInput): AnthropometryInsertInput {
  const measuredAt = normalizeDate(input.measuredAt);
  const weightKg = toNullableNumber(input.weightKg);
  const heightCm = toNullableNumber(input.heightCm);
  const bmi = input.bmi != null ? toNullableNumber(input.bmi) : calcBmi(weightKg, heightCm);

  return {
    clientId: stringOrNull(input.clientId) ?? '',
    measuredAt,
    weightKg,
    heightCm,
    bodyFatPct: toNullableNumber(input.bodyFatPct),
    chestCm: toNullableNumber(input.chestCm),
    waistCm: toNullableNumber(input.waistCm),
    hipCm: toNullableNumber(input.hipCm),
    thighCm: toNullableNumber(input.thighCm),
    armCm: toNullableNumber(input.armCm),
    calfCm: toNullableNumber(input.calfCm),
    shouldersCm: toNullableNumber(input.shouldersCm),
    neckCm: toNullableNumber(input.neckCm),
    bmi,
    notes: stringOrNull(input.notes),
    createdById: stringOrNull(input.createdById),
  };
}

function pickDate(row: Record<string, any>): string | null {
  const raw =
    row.measured_at ??
    row.date ??
    row.taken_at ??
    row.measuredAt ??
    row.created_at ??
    row.inserted_at ??
    null;
  return isoOrNull(raw);
}

function isoOrNull(value: unknown): string | null {
  if (!value) return null;
  try {
    const iso = new Date(value as string).toISOString();
    return iso;
  } catch {
    return null;
  }
}

function numberOrNull(value: unknown): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const num = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  return Number.isFinite(num) ? num : null;
}

function stringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

function calcBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const meters = heightCm / 100;
  if (!meters) return null;
  const bmi = weightKg / (meters * meters);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : null;
}

function isMissingColumn(error: PostgrestError | null, column: string): boolean {
  if (!error) return false;
  if (error.code && error.code !== COLUMN_MISSING_CODE) return false;
  const haystack = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase();
  return haystack.includes(column.toLowerCase());
}
