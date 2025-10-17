'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';

export type SearchPermissions = {
  users: boolean;
  sessions: boolean;
  approvals: boolean;
};

export type SearchResults = {
  query: string;
  supabase: boolean;
  permissions: SearchPermissions;
  users: Array<{ id: string; name: string; role: string; email: string | null }>;
  sessions: Array<{
    id: string;
    when: string | null;
    trainer: string;
    client: string;
    location: string | null;
  }>;
  approvals: Array<{ id: string; name: string | null; email: string | null; status: string }>;
};

type Props = {
  initialQuery: string;
  results: SearchResults;
};

const sessionDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatSessionWhen(when: string | null) {
  if (!when) return 'Data a definir';
  const date = new Date(when);
  if (Number.isNaN(date.getTime())) return 'Data a definir';
  return sessionDateFormatter.format(date);
}

function normalizeRole(role: string | null | undefined): 'ADMIN' | 'TRAINER' | 'CLIENT' {
  const normalized = (role ?? '').toUpperCase();
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'TRAINER' || normalized === 'PT') return 'TRAINER';
  return 'CLIENT';
}

function approvalTone(status: string | null | undefined): 'ok' | 'warn' | 'down' {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'approved' || normalized === 'active') return 'ok';
  if (normalized === 'pending' || normalized === 'review') return 'warn';
  return 'down';
}

function approvalLabel(status: string | null | undefined) {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'approved') return 'Aprovado';
  if (normalized === 'pending') return 'Pendente';
  if (normalized === 'rejected') return 'Rejeitado';
  return (status ?? 'Desconhecido').toString();
}

export default function SearchClient({ initialQuery, results }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const submit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const query = term.trim();
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, term],
  );

  useEffect(() => {
    setTerm(initialQuery);
  }, [initialQuery]);

  const sections = useMemo(
    () => ({
      users: results.permissions.users ? results.users : [],
      sessions: results.permissions.sessions ? results.sessions : [],
      approvals: results.permissions.approvals ? results.approvals : [],
    }),
    [results.approvals, results.permissions, results.sessions, results.users],
  );

  const empty = useMemo(
    () => !sections.users.length && !sections.sessions.length && !sections.approvals.length,
    [sections.approvals.length, sections.sessions.length, sections.users.length],
  );

  const restricted = useMemo(() => {
    const blocked: string[] = [];
    if (!results.permissions.users) blocked.push('utilizadores');
    if (!results.permissions.sessions) blocked.push('sessões');
    if (!results.permissions.approvals) blocked.push('aprovações');
    if (blocked.length === 0 || blocked.length === 3) return null;
    return blocked;
  }, [results.permissions]);

  const supabaseState = results.supabase ? 'ok' : 'warn';
  const supabaseLabel = results.supabase ? 'Dados em tempo real' : 'Modo offline';

  return (
    <div className="client-search">
      <PageHeader
        title="Pesquisa global"
        subtitle="Procura utilizadores, sessões agendadas ou pedidos de aprovação."
        actions={<span className="status-pill" data-state={supabaseState}>{supabaseLabel}</span>}
        sticky={false}
      />

      <section className="neo-panel client-search__panel" aria-labelledby="client-search-form">
        <h2 id="client-search-form" className="sr-only">
          Pesquisar na plataforma
        </h2>
        <form className="client-search__form" onSubmit={submit}>
          <label className="neo-input-group__field client-search__field">
            <span className="neo-input-group__label">Termo de pesquisa</span>
            <div className="client-search__input">
              <span className="client-search__icon" aria-hidden>
                <SearchIcon />
              </span>
              <input
                type="search"
                className="neo-input client-search__control"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Pesquisar por nome, email ou local..."
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </label>
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            className="client-search__submit"
          >
            {isPending ? 'A pesquisar…' : 'Pesquisar'}
          </Button>
        </form>
        <p className="client-search__hint">
          Os resultados são{' '}
          {results.supabase
            ? 'baseados na base de dados actual.'
            : 'carregados a partir de amostras locais porque o Supabase não está configurado.'}
        </p>
        {restricted && (
          <Alert
            tone="warning"
            className="client-search__notice"
            title="Algumas secções estão limitadas"
          >
            A tua conta não tem acesso à pesquisa de {restricted.join(' e ')}.
          </Alert>
        )}
      </section>

      {empty ? (
        <section className="neo-panel client-search__panel" aria-live="polite">
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              🔍
            </span>
            <p className="neo-empty__title">Sem resultados</p>
            <p className="neo-empty__description">
              Ajusta o termo de pesquisa ou tenta outros critérios. Procura por nomes de clientes, emails ou locais de sessão.
            </p>
          </div>
        </section>
      ) : (
        <div className="client-search__grid">
          {results.permissions.users && (
            <section className="neo-panel client-search__section" aria-labelledby="client-search-users">
              <header className="client-search__sectionHeader">
                <div className="client-search__sectionTitle">
                  <UsersIcon />
                  <h2 id="client-search-users">Utilizadores</h2>
                </div>
                <span className="client-search__count">{sections.users.length}</span>
              </header>
              <ul className="client-search__list">
                {sections.users.map((user) => {
                  const role = normalizeRole(user.role);
                  return (
                    <li key={user.id}>
                      <article className="neo-surface client-search__item">
                        <div className="client-search__itemBody">
                          <span className="client-search__itemTitle">{user.name}</span>
                          {user.email && <span className="client-search__itemMeta">{user.email}</span>}
                        </div>
                        <span className="client-search__badge" data-role={role}>
                          {role === 'TRAINER' ? 'TREINADOR' : role}
                        </span>
                      </article>
                    </li>
                  );
                })}
                {!sections.users.length && (
                  <li>
                    <div className="client-search__emptyItem">Nenhum utilizador corresponde à pesquisa.</div>
                  </li>
                )}
              </ul>
            </section>
          )}

          {results.permissions.sessions && (
            <section className="neo-panel client-search__section" aria-labelledby="client-search-sessions">
              <header className="client-search__sectionHeader">
                <div className="client-search__sectionTitle">
                  <SessionsIcon />
                  <h2 id="client-search-sessions">Sessões</h2>
                </div>
                <span className="client-search__count">{sections.sessions.length}</span>
              </header>
              <ul className="client-search__list">
                {sections.sessions.map((session) => (
                  <li key={session.id}>
                    <article className="neo-surface client-search__item">
                      <div className="client-search__itemBody">
                        <span className="client-search__itemTitle">{session.trainer}</span>
                        <span className="client-search__itemMeta">
                          {session.client} • {formatSessionWhen(session.when)}
                        </span>
                      </div>
                      {session.location && (
                        <span className="client-search__badge" data-variant="location">
                          {session.location}
                        </span>
                      )}
                    </article>
                  </li>
                ))}
                {!sections.sessions.length && (
                  <li>
                    <div className="client-search__emptyItem">Sem sessões compatíveis.</div>
                  </li>
                )}
              </ul>
            </section>
          )}

          {results.permissions.approvals && (
            <section className="neo-panel client-search__section" aria-labelledby="client-search-approvals">
              <header className="client-search__sectionHeader">
                <div className="client-search__sectionTitle">
                  <ApprovalsIcon />
                  <h2 id="client-search-approvals">Pedidos</h2>
                </div>
                <span className="client-search__count">{sections.approvals.length}</span>
              </header>
              <div className="client-search__approvalsGrid">
                {sections.approvals.map((approval) => (
                  <article key={approval.id} className="neo-surface client-search__approval">
                    <div className="client-search__itemBody">
                      <span className="client-search__itemTitle">{approval.name ?? 'Pedido sem nome'}</span>
                      {approval.email && <span className="client-search__itemMeta">{approval.email}</span>}
                    </div>
                    <span className="status-pill client-search__badge" data-state={approvalTone(approval.status)}>
                      {approvalLabel(approval.status)}
                    </span>
                  </article>
                ))}
                {!sections.approvals.length && (
                  <div className="client-search__emptyItem">Sem pedidos compatíveis.</div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a3 3 0 0 0-2.4-2.93" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 3.5a2.5 2.5 0 0 1 0 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="18" rx="4" />
      <path d="M16 2v4" strokeLinecap="round" />
      <path d="M8 2v4" strokeLinecap="round" />
      <path d="M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function ApprovalsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4h16v12H5.5L4 17.5V4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 10 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
