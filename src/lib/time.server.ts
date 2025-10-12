import { cookies, headers } from "next/headers";

import { DEFAULT_TIME_ZONE } from "./time-constants";

/** Resolve o fuso horário do utilizador (server-side). */
export async function getUserTimeZoneServer(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const stored = cookieStore.get("tz")?.value;
    if (stored) {
      return decodeURIComponent(stored);
    }
  } catch {
    // Ignorar: contexto sem cookies (ex.: Edge sem suporte)
  }

  try {
    const h = await headers();
    const fromEdge =
      h.get("x-vercel-ip-timezone") ||
      h.get("x-timezone");
    if (fromEdge) {
      return fromEdge;
    }
  } catch {
    // Ignorar: headers indisponíveis
  }

  return DEFAULT_TIME_ZONE;
}

export async function getUserTimeZone(): Promise<string> {
  return getUserTimeZoneServer();
}
