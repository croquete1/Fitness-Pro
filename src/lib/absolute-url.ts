// Util para construir URLs absolutas no servidor (RSC/SSR)
import { headers } from "next/headers";

export function absoluteUrl(path = "") {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  if (!path.startsWith("/")) path = `/${path}`;
  return `${proto}://${host}${path}`;
}
