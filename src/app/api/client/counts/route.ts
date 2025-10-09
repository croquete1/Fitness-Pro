import { NextResponse } from 'next/server';
import { getClientCounts } from '@/lib/server/getInitialCounts';

export async function GET() {
  const counts = await getClientCounts();
  return NextResponse.json(counts);
}
