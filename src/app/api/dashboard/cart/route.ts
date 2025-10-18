// src/app/api/dashboard/chart/route.ts
import { NextResponse } from 'next/server';

import { tryCreateServerClient } from '@/lib/supabaseServer';

const SERIES_KEY = 'monthly_sessions';

const FALLBACK_POINTS = [
  { name: 'Jan', value: 30 },
  { name: 'Fev', value: 45 },
  { name: 'Mar', value: 60 },
  { name: 'Abr', value: 50 },
  { name: 'Mai', value: 70 },
  { name: 'Jun', value: 65 },
];

export async function GET() {
  const sb = tryCreateServerClient();
  if (!sb) {
    return NextResponse.json(FALLBACK_POINTS);
  }

  try {
    const { data, error } = await sb
      .from('dashboard_chart_points')
      .select('label, value, sort_order')
      .eq('series', SERIES_KEY)
      .order('sort_order', { ascending: true })
      .order('label', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(FALLBACK_POINTS);
    }

    const chartData = data.map((point) => ({
      name: point.label,
      value: typeof point.value === 'number' ? point.value : Number(point.value ?? 0),
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.warn('[api/dashboard/cart] fallback sample data', error);
    return NextResponse.json(FALLBACK_POINTS);
  }
}
