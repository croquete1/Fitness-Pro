// Helpers de RBAC simples e tipados
export type UserRole = "ADMIN" | "TRAINER" | "CLIENT";
export type AnyRole = UserRole | null | undefined;

export const isAdmin = (role: AnyRole) => role === "ADMIN";
export const isTrainer = (role: AnyRole) => role === "TRAINER";
export const canAccessTrainer = (role: AnyRole) => isAdmin(role) || isTrainer(role);
