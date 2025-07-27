// src/app/api/dashboard/activities/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: busca real no DB
  const activities = [
    { id: '1', description: 'Login efetuado',                   timestamp: '2025-07-27T10:15:00Z' },
    { id: '2', description: 'Novo registo concluído',           timestamp: '2025-07-27T09:50:00Z' },
    { id: '3', description: 'Perfil atualizado',               timestamp: '2025-07-26T16:20:00Z' },
    { id: '4', description: 'Senha alterada',                  timestamp: '2025-07-26T14:05:00Z' },
  ];
  return NextResponse.json(activities);
}
