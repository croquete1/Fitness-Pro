// src/app/api/admin/exercises/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // stub seguro até existir tabela própria
  const data = [
    { id: "ex1", name: "Agachamento", category: "Pernas", updatedAt: new Date().toISOString() },
    { id: "ex2", name: "Supino", category: "Peito", updatedAt: new Date().toISOString() },
  ];
  return NextResponse.json({ ok: true, data });
}
