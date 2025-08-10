"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@prisma/client";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
};

const AuthContext = createContext<{ user: AuthUser | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (data?.user?.id) {
          setUser({
            id: data.user.id,
            name: data.user.name ?? null,
            email: data.user.email ?? null,
            role: (data.user.role as Role) ?? "CLIENT",
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
