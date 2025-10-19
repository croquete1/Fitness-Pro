import { NextResponse } from 'next/server';
import { loadNavigationSummary } from '@/lib/navigation/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get('role');
  const userId = url.searchParams.get('userId');

  try {
    const summary = await loadNavigationSummary({ role, userId });
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[api/navigation/summary] erro ao carregar', error);
    return NextResponse.json({ error: 'NAVIGATION_SUMMARY_FAILED' }, { status: 500 });
  }
}
