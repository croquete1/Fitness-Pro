// src/app/api/dashboard/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: busca real no DB
  const users = [
    { name: 'Ana Silva',     email: 'ana.silva@example.com',    createdAt: '2025-07-25' },
    { name: 'Bruno Costa',   email: 'bruno.costa@example.com',  createdAt: '2025-07-26' },
    { name: 'Carla Mendes',  email: 'carla.mendes@example.com', createdAt: '2025-07-27' },
  ];
  return NextResponse.json(users);
}
