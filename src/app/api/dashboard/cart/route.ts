// src/app/api/dashboard/chart/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: busca real no DB
  const chartData = [
    { name: 'Jan', value: 30 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 60 },
    { name: 'Abr', value: 50 },
    { name: 'Mai', value: 70 },
    { name: 'Jun', value: 65 },
  ];
  return NextResponse.json(chartData);
}
