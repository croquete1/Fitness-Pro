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

/** Cumprimento em PT a partir do fuso. */
export function greetingForTZ(
  tz: string,
): "Boa madrugada" | "Bom dia" | "Boa tarde" | "Boa noite" {
  const h = getHourInTZ(tz);
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}
