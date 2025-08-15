// src/app/api/system/info/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    node: process.versions?.node,
    next: process.env?.NEXT_RUNTIME ? "edge" : process.version,
    now: new Date().toISOString(),
  };
  return NextResponse.json({ ok: true, data });
}
