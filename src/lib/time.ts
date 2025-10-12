import { DEFAULT_TIME_ZONE } from "./time-constants";

/** Resolve o fuso horário do utilizador, independentemente do ambiente. */
export async function getUserTimeZone(): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      return (
        Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
      );
    } catch {
      return DEFAULT_TIME_ZONE;
    }
  }

  return DEFAULT_TIME_ZONE;
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

export { DEFAULT_TIME_ZONE } from "./time-constants";
