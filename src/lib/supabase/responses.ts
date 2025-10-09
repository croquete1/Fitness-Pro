import { NextResponse } from 'next/server';
import { MissingSupabaseEnvError } from '@/lib/supabaseServer';

export function supabaseConfigErrorResponse(err: unknown) {
  if (err instanceof MissingSupabaseEnvError) {
    return NextResponse.json(
      { message: 'Supabase não está configurado.' },
      { status: 503 }
    );
  }
  return null;
}
