// src/app/(app)/dashboard/settings/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { createServerClient } from "@/lib/supabaseServer";
import { toAppRole, type AppRole } from "@/lib/roles";
import SettingsClient, {
  type SettingsModel,
} from "./settings-client";
import {
  defaultAdminSettings,
  defaultClientSettings,
  defaultNotificationPreferences,
  defaultTrainerSettings,
} from "./settings.defaults";

export const metadata: Metadata = { title: "Definições" };

function parseJson<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? (parsed as T) : null;
  } catch {
    return null;
  }
}

function roleStorageKey(role: AppRole) {
  if (role === "ADMIN") return "admin" as const;
  if (role === "PT") return "trainer" as const;
  return "client" as const;
}

export default async function SettingsPage() {
  const session = await getSessionUserSafe();
  if (!session?.id) redirect("/login");

  const role = toAppRole(session.role ?? session.user?.role) ?? "CLIENT";
  const userId = session.id;

  const sb = createServerClient();

  const [userRow, profileRow, privateRow] = await Promise.all([
    sb
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .maybeSingle(),
    sb
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .maybeSingle(),
    sb
      .from("profile_private" as any)
      .select("phone, settings")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const email = userRow.data?.email ?? session.email ?? "";
  const name = profileRow.data?.name ?? userRow.data?.name ?? session.name ?? "";
  const phone = (privateRow.data as any)?.phone ?? null;

  type StoredSettings = {
    language?: string;
    theme?: string;
    notifications?: Partial<ReturnType<typeof defaultNotificationPreferences>>;
    role?: Record<string, Record<string, unknown>>;
  } | null;

  const storedSettings = parseJson<StoredSettings>(privateRow.data?.settings) ??
    ((privateRow.data as any)?.settings as StoredSettings ?? null);

  const notificationsDefaults = defaultNotificationPreferences();
  const storedNotifications = storedSettings?.notifications ?? {};

  const notifications = {
    email:
      typeof storedNotifications.email === "boolean"
        ? storedNotifications.email
        : notificationsDefaults.email,
    push:
      typeof storedNotifications.push === "boolean"
        ? storedNotifications.push
        : notificationsDefaults.push,
    sms:
      typeof storedNotifications.sms === "boolean"
        ? storedNotifications.sms
        : notificationsDefaults.sms,
    summary:
      storedNotifications.summary &&
      ["daily", "weekly", "monthly", "never"].includes(
        String(storedNotifications.summary),
      )
        ? (storedNotifications.summary as typeof notificationsDefaults.summary)
        : notificationsDefaults.summary,
  } satisfies SettingsModel["notifications"];

  const theme = storedSettings?.theme;
  const resolvedTheme: SettingsModel["theme"] =
    theme === "dark" || theme === "light" || theme === "system"
      ? theme
      : "system";

  const language = storedSettings?.language ?? "pt-PT";

  const storedRoleSettings = storedSettings?.role?.[roleStorageKey(role)] ?? {};

  const model: SettingsModel = {
    id: userId,
    role,
    name,
    phone: typeof phone === "string" ? phone : null,
    email,
    language,
    theme: resolvedTheme,
    notifications,
  };

  if (role === "ADMIN") {
    model.adminPreferences = {
      ...defaultAdminSettings(),
      ...(storedRoleSettings as SettingsModel["adminPreferences"] ?? {}),
    };
  }
  if (role === "PT") {
    model.trainerPreferences = {
      ...defaultTrainerSettings(),
      ...(storedRoleSettings as SettingsModel["trainerPreferences"] ?? {}),
    };
  }
  if (role === "CLIENT") {
    model.clientPreferences = {
      ...defaultClientSettings(),
      ...(storedRoleSettings as SettingsModel["clientPreferences"] ?? {}),
    };
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Definições</h1>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Personaliza a tua conta, gere notificações e ajusta preferências para
          o teu papel na plataforma.
        </p>
      </div>
      <SettingsClient model={model} />
    </main>
  );
}
