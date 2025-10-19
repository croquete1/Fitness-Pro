import { NextResponse } from 'next/server';
import { getLandingSummary } from '@/lib/public/landing/dashboard';
import { getFallbackLandingSummary } from '@/lib/fallback/auth-landing';

export const revalidate = 300;

export async function GET() {
  try {
    const summary = await getLandingSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[landing-summary] Falha a obter métricas públicas', error);
    const fallback = getFallbackLandingSummary();
    return NextResponse.json(fallback);
  }
}
