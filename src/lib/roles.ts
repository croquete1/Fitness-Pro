export type AppRole = "admin" | "pt" | "client";

/** Converte valores vindos da BD/sessão para o nosso enum canónico ("admin"|"pt"|"client") */
export function toAppRole(value: unknown): AppRole {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "admin" || v === "administrator") return "admin";
  if (v === "pt" || v === "trainer" || v === "coach" || v === "treinador") return "pt";
  if (v === "client" || v === "cliente" || v === "user") return "client";

  // Aceita variantes em maiúsculas
  if (v === "trainER".toLowerCase() || v === "trainer".toLowerCase()) return "pt"; // redundante mas seguro
  if (v === "admin".toLowerCase()) return "admin";
  if (v === "client".toLowerCase()) return "client";

  // Fallback seguro
  return "client";
}

export const isAdmin = (r: unknown) => toAppRole(r) === "admin";
export const isPT    = (r: unknown) => toAppRole(r) === "pt";
export const isClient= (r: unknown) => toAppRole(r) === "client";
