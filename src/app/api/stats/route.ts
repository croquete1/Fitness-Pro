// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: busca real no DB
  const stats = [
    { title: 'Novos Utilizadores', value: 154,  colorClass: 'bg-blue-100 text-blue-800' },
    { title: 'Vendas',            value: 87,   colorClass: 'bg-green-100 text-green-800' },
    { title: 'Visitas',           value: '1.2k', colorClass: 'bg-purple-100 text-purple-800' },
  ];
  return NextResponse.json(stats);
}
