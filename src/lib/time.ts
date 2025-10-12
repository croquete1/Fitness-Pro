import { cookies, headers } from "next/headers";

/** Resolve o fuso horário do utilizador (server-side). */
export async function getUserTimeZone(): Promise<string> {
  try {
    const c = (await cookies()).get("tz")?.value;
    if (c) return decodeURIComponent(c);
  } catch {/* ignore */}

  try {
    const h = await headers();
    const fromEdge =
      h.get("x-vercel-ip-timezone") || // Vercel Edge hint
      h.get("x-timezone");             // fallback se definires este header
    if (fromEdge) return fromEdge;
  } catch {/* ignore */}

  return process.env.DEFAULT_TZ || "Europe/Lisbon";
}

/** Hora (0–23) no fuso especificado. */
export function getHourInTZ(tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: tz,
    });
    const parts = fmt.formatToParts(new Date());
    const hh = parts.find((p) => p.type === "hour")?.value ?? "0";
    const n = Number(hh);
    if (Number.isFinite(n)) return n;
  } catch {/* ignore */}
  return new Date().getHours();
}

export type GreetingLabel = "Boa madrugada" | "Bom dia" | "Boa tarde" | "Boa noite";

export type GreetingInfo = {
  label: GreetingLabel;
  emoji: string;
};

function normaliseHour(hour: number): number {
  if (!Number.isFinite(hour)) return 0;
  const rounded = Math.trunc(hour);
  return ((rounded % 24) + 24) % 24;
}

export function greetingForHour(hour: number): GreetingInfo {
  const h = normaliseHour(hour);
  if (h >= 19) return { label: "Boa noite", emoji: "🌙" };
  if (h >= 12) return { label: "Boa tarde", emoji: "🌤️" };
  if (h >= 6) return { label: "Bom dia", emoji: "🌅" };
  return { label: "Boa madrugada", emoji: "🦉" };
}

export function greetingForDate(date: Date = new Date()): GreetingInfo {
  return greetingForHour(date.getHours());
}

/** Cumprimento em PT a partir do fuso. */
export function greetingForTZ(tz: string): GreetingLabel {
  return greetingForHour(getHourInTZ(tz)).label;
}

export function greetingInfoForTZ(tz: string): GreetingInfo {
  return greetingForHour(getHourInTZ(tz));
}
