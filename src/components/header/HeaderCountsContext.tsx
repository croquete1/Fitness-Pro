'use client';

import * as React from 'react';

export type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

export type HeaderCounts = {
  approvalsCount: number;
  messagesCount: number;
  notificationsCount: number;
};

type ContextValue = {
  role: Role;
  approvalsCount: number;
  messagesCount: number;
  notificationsCount: number;
  loading: boolean;
  error: unknown;
  /** Faz um fetch aos counts (com AbortController). */
  refresh: () => Promise<void>;
  /** Atualiza parcialmente os counts em memória (optimistic/UI). */
  setCounts: (partial: Partial<HeaderCounts>) => void;
};

const Ctx = React.createContext<ContextValue | null>(null);

export function useHeaderCounts(): ContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error('useHeaderCounts deve ser usado dentro de <HeaderCountsProvider>.');
  }
  return ctx;
}

type ProviderProps = {
  role: Role;
  /** Valores iniciais (planos), p.ex. do fetch no layout server-side. */
  initial?: Partial<HeaderCounts>;
  /** Override do endpoint (opcional). */
  countsUrlOverride?: string;
  /** Auto refresh (default: true). */
  autoRefresh?: boolean;
  /** Intervalo do auto refresh (ms). Default: 30_000. */
  refreshMs?: number;
  children: React.ReactNode;
};

export function HeaderCountsProvider({
  role,
  initial,
  countsUrlOverride,
  autoRefresh = true,
  refreshMs = 30_000,
  children,
}: ProviderProps) {
  const [approvalsCount, setApprovalsCount] = React.useState<number>(initial?.approvalsCount ?? 0);
  const [messagesCount, setMessagesCount] = React.useState<number>(initial?.messagesCount ?? 0);
  const [notificationsCount, setNotificationsCount] = React.useState<number>(initial?.notificationsCount ?? 0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const pickUrl = React.useCallback((): string => {
    if (countsUrlOverride) return countsUrlOverride;
    // fallback inteligentes por role
    if (role === 'ADMIN') return '/api/admin/counts';
    if (role === 'TRAINER') return '/api/trainer/counts'; // se não existir, cairá no fallback abaixo
    return '/api/client/counts';
  }, [countsUrlOverride, role]);

  const parseCounts = React.useCallback((j: any) => {
    // tolerante a formatos: { approvalsCount, messagesCount, notificationsCount }
    // ou { approvals, messages, notifications } ou { admin:{...} / client:{...} }
    const src = j?.admin ?? j?.client ?? j ?? {};
    return {
      approvalsCount: Number(src.approvalsCount ?? src.approvals ?? 0) || 0,
      messagesCount: Number(src.messagesCount ?? src.messages ?? 0) || 0,
      notificationsCount: Number(src.notificationsCount ?? src.notifications ?? 0) || 0,
    } as HeaderCounts;
  }, []);

  const refresh = React.useCallback(async () => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    try {
      let url = pickUrl();
      let r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok && role === 'TRAINER') {
        // fallback para o caso de /api/trainer/counts não existir no teu projeto
        url = '/api/client/counts';
        r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      }
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      const c = parseCounts(j);
      setApprovalsCount(c.approvalsCount);
      setMessagesCount(c.messagesCount);
      setNotificationsCount(c.notificationsCount);
    } catch (e) {
      setError(e);
      // não atira erro — mantém último snapshot do state
    } finally {
      setLoading(false);
    }
    // não devolvemos controller; a chamada é “fire-and-await”
  }, [pickUrl, role, parseCounts]);

  // auto-refresh com cleanup
  React.useEffect(() => {
    if (!autoRefresh) return;
    let alive = true;
    let t: number | undefined;

    const tick = async () => {
      if (!alive) return;
      await refresh();
      if (!alive) return;
      t = window.setTimeout(tick, refreshMs);
    };

    // primeira sincronização “a frio”
    void tick();

    return () => {
      alive = false;
      if (t) clearTimeout(t);
    };
  }, [autoRefresh, refreshMs, refresh]);

  const setCounts = React.useCallback((partial: Partial<HeaderCounts>) => {
    if (typeof partial.approvalsCount === 'number') setApprovalsCount(partial.approvalsCount);
    if (typeof partial.messagesCount === 'number') setMessagesCount(partial.messagesCount);
    if (typeof partial.notificationsCount === 'number') setNotificationsCount(partial.notificationsCount);
  }, []);

  const value: ContextValue = {
    role,
    approvalsCount,
    messagesCount,
    notificationsCount,
    loading,
    error,
    refresh,
    setCounts,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
