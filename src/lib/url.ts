import { headers } from "next/headers";

/** Base URL preferida: NEXT_PUBLIC_BASE_URL > VERCEL_URL > host do request > localhost */
export function getBaseUrl(): string {
  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (publicBase) return publicBase.replace(/\/+$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, "")}`;

  try {
    const h = headers();
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      "";
    const proto = (h.get("x-forwarded-proto") ?? "http").split(",")[0];
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() só existe em contexto server — ignorar fora disso
  }

  return "http://localhost:3000";
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getBaseUrl();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/** Wrapper de fetch para uso no servidor com paths relativos */
export async function serverFetch(input: string | URL, init?: RequestInit) {
  const abs =
    typeof input === "string" || input instanceof URL
      ? toAbsoluteUrl(String(input))
      : input;
  return fetch(abs, init);
}
