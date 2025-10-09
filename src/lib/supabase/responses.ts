import { NextResponse } from 'next/server';
import { MissingSupabaseEnvError } from '@/lib/supabaseServer';

const NO_STORE_HEADER = { 'cache-control': 'no-store' } as const;

export function supabaseConfigErrorResponse(err: unknown) {
  if (err instanceof MissingSupabaseEnvError) {
    return NextResponse.json(
      { message: 'Supabase não está configurado.' },
      { status: 503 }
    );
  }
  return null;
}

export function supabaseUnavailableResponse() {
  return NextResponse.json(
    { message: 'Supabase não está configurado.' },
    { status: 503, headers: NO_STORE_HEADER }
  );
}

export function supabaseFallbackJson<T extends Record<string, unknown>>(
  payload: T,
  init?: ResponseInit
) {
  return NextResponse.json(
    { ...payload, _supabaseConfigured: false },
    {
      status: init?.status ?? 200,
      headers: { ...NO_STORE_HEADER, ...(init?.headers ?? {}) },
    }
  );
}
