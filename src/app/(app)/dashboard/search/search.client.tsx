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

export type SearchResults = {
  query: string;
  supabase: boolean;
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

  const empty = useMemo(
    () => !results.users.length && !results.sessions.length && !results.approvals.length,
    [results.approvals.length, results.sessions.length, results.users.length],
  );

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
          <section className="neo-panel client-search__section" aria-labelledby="client-search-users">
            <header className="client-search__sectionHeader">
              <div className="client-search__sectionTitle">
                <UsersIcon />
                <h2 id="client-search-users">Utilizadores</h2>
              </div>
              <span className="client-search__count">{results.users.length}</span>
            </header>
            <ul className="client-search__list">
              {results.users.map((user) => {
                const role = normalizeRole(user.role);
                return (
                  <li key={user.id}>
                    <article className="neo-surface client-search__item">
                      <div className="client-search__itemBody">
                        <span className="client-search__itemTitle">{user.name}</span>
                        {user.email && (
                          <span className="client-search__itemMeta">{user.email}</span>
                        )}
                      </div>
                      <span className="client-search__badge" data-role={role}>
                        {role === 'TRAINER' ? 'TREINADOR' : role}
                      </span>
                    </article>
                  </li>
                );
              })}
              {!results.users.length && (
                <li>
                  <div className="client-search__emptyItem">Nenhum utilizador corresponde à pesquisa.</div>
                </li>
              )}
            </ul>
          </section>

          <section className="neo-panel client-search__section" aria-labelledby="client-search-sessions">
            <header className="client-search__sectionHeader">
              <div className="client-search__sectionTitle">
                <SessionsIcon />
                <h2 id="client-search-sessions">Sessões</h2>
              </div>
              <span className="client-search__count">{results.sessions.length}</span>
            </header>
            <ul className="client-search__list">
              {results.sessions.map((session) => (
                <li key={session.id}>
                  <article className="neo-surface client-search__item">
                    <div className="client-search__itemBody">
                      <span className="client-search__itemTitle">{formatSessionWhen(session.when)}</span>
                      <span className="client-search__itemMeta">
                        {session.trainer} · {session.client}
                      </span>
                    </div>
                    <span className="client-search__badge" data-variant="location">
                      {session.location || 'Local por definir'}
                    </span>
                  </article>
                </li>
              ))}
              {!results.sessions.length && (
                <li>
                  <div className="client-search__emptyItem">Nenhuma sessão encontrada para o termo indicado.</div>
                </li>
              )}
            </ul>
          </section>
        </div>
      )}

      <section className="neo-panel client-search__section" aria-labelledby="client-search-approvals">
        <header className="client-search__sectionHeader">
          <div className="client-search__sectionTitle">
            <ApprovalsIcon />
            <h2 id="client-search-approvals">Aprovações</h2>
          </div>
          <span className="client-search__count">{results.approvals.length}</span>
        </header>
        <div className="client-search__approvalsGrid">
          {results.approvals.map((approval) => (
            <article key={approval.id} className="neo-surface client-search__approval">
              <div className="client-search__itemBody">
                <span className="client-search__itemTitle">{approval.name ?? 'Utilizador'}</span>
                {approval.email && (
                  <span className="client-search__itemMeta">{approval.email}</span>
                )}
              </div>
              <span className="status-pill" data-state={approvalTone(approval.status)}>
                {approvalLabel(approval.status)}
              </span>
            </article>
          ))}
          {!results.approvals.length && (
            <div className="client-search__emptyItem">Nenhum pedido de aprovação corresponde à pesquisa.</div>
          )}
        </div>
      </section>
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
