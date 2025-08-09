export type UserRole = "cliente" | "pt" | "admin";

export type SessionUser = {
  id: string;
  email?: string;
  name?: string | null;
  role: UserRole;
};
