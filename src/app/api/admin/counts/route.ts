import { NextResponse } from 'next/server';
import { getAdminCounts } from '@/lib/server/getInitialCounts';

export async function GET() {
  const counts = await getAdminCounts();
  return NextResponse.json(counts);
}
