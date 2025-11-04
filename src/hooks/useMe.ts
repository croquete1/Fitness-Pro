"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "TRAINER" | "CLIENT" | string;
};

type SessionPayload = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string | null;
  } | null;
  role?: string | null;
};

const debug = (message: string, detail?: unknown) => {
  if (typeof console === "undefined" || typeof console.debug !== "function") return;
  if (detail !== undefined) {
    console.debug(`[useMe] ${message}`, detail);
    return;
  }
  console.debug(`[useMe] ${message}`);
};

export async function readCurrentUser(fetchImpl: typeof fetch = fetch): Promise<CurrentUser | null> {
  try {
    const response = await fetchImpl("/api/auth/session", { credentials: "include" });
    if (!response.ok) {
      debug("session request failed", { status: response.status });
      return null;
    }

    let payload: SessionPayload | null = null;
    try {
      payload = (await response.json()) as SessionPayload | null;
    } catch (error) {
      debug("failed to parse session payload", error);
      return null;
    }

    const rawUser = payload?.user ?? null;
    if (!rawUser) {
      debug("session payload did not include user data");
      return null;
    }

    const rawRole = typeof rawUser.role === "string" && rawUser.role.trim().length > 0
      ? rawUser.role
      : typeof payload?.role === "string" && payload.role.trim().length > 0
        ? payload.role
        : undefined;

    const normalized: CurrentUser = {
      id: rawUser.id ?? undefined,
      name: rawUser.name ?? undefined,
      email: rawUser.email ?? undefined,
    };

    if (rawRole) normalized.role = rawRole;

    return normalized;
  } catch (error) {
    debug("session request threw", error);
    return null;
  }
}

export function useMe() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const current = await readCurrentUser();
        if (alive) setUser(current);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { user, loading };
}
