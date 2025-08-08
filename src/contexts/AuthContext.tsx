"use client";

import { createContext, useContext, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: "cliente" | "pt" | "admin";
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, data } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      user: data?.user
        ? {
            id: (data.user as { id: string }).id,
            email: data.user.email ?? null,
            name: data.user.name ?? null,
            role: (data.user as { role: "cliente" | "pt" | "admin" }).role ?? "cliente",
          }
        : null,
      async login(email: string, password: string) {
        const res = await signIn("credentials", { email, password, redirect: false });
        return !!res?.ok;
      },
      async logout() {
        await signOut({ redirect: false });
      },
    };
  }, [status, data]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
