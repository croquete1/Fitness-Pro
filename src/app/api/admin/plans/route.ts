// src/app/api/admin/plans/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    { id: "pl1", name: "Full Body Iniciante", author: "Equipa", sessions: 8, updatedAt: new Date().toISOString() },
    { id: "pl2", name: "Hipertrofia A/B", author: "Equipa", sessions: 10, updatedAt: new Date().toISOString() },
  ];
  return NextResponse.json({ ok: true, data });
}
