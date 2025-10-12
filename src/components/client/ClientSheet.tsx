'use client';

import React from 'react';
import type {
  UiUser,
  UiTrainer,
  AnthropometryEntry,
  PackageSubscription,
  TrainingPlanSummary,
  Note,
  SessionSummary,
} from '@/types/user';

// Reexport para compatibilidade: quem importava os tipos a partir deste componente continua a funcionar
export type {
  UiUser,
  UiTrainer,
  AnthropometryEntry,
  PackageSubscription,
  TrainingPlanSummary,
  Note,
  SessionSummary,
} from '@/types/user';

type Props = {
  /** Utilizador a exibir (cliente) */
  user: UiUser;

  /** Fluxo Admin (opcional) */
  trainers?: UiTrainer[];
  currentTrainerIds?: string[];

  /** Fluxo PT (opcional) */
  role?: 'PT' | 'ADMIN' | 'CLIENT';
  anthropometry?: AnthropometryEntry[];
  currentPackage?: PackageSubscription | null;
  packageHistory?: PackageSubscription[];
  plans?: TrainingPlanSummary[];
  notes?: Note[];
  sessions?: SessionSummary[];
};

export default function ClientSheet({
  user,
  trainers,
  currentTrainerIds,
  role,
  anthropometry,
  currentPackage,
  packageHistory,
  plans,
  notes,
  sessions,
}: Props) {
  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      {/* HEADER */}
      <header
        className="card"
        style={{
          padding: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{user.name ?? user.email}</h2>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {user.email} • {user.role} • {user.status}
            {role ? <> • contexto: {role}</> : null}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Criado em {new Date(user.createdAt).toLocaleString()}
        </div>
      </header>

      {/* ADMIN: lista de Personal Trainers + vínculos (mostra só se vierem props) */}
      {Array.isArray(trainers) && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Personal Trainers disponíveis</h3>
          {trainers.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sem Personal Trainers ativos.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {trainers.map((t) => {
                const selected = currentTrainerIds?.includes(t.id) ?? false;
                return (
                  <li key={t.id} style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{t.name ?? t.email}</span>
                    <span style={{ opacity: 0.7 }}> — {t.email}</span>
                    {selected && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          padding: '2px 6px',
                          borderRadius: 999,
                          border: '1px solid currentColor',
                          opacity: 0.8,
                        }}
                      >
                        associado
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* PT: pacote atual e histórico */}
      {(currentPackage || (packageHistory && packageHistory.length > 0)) && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Planos / Pacotes</h3>

          {currentPackage ? (
            <div style={{ marginBottom: 8 }}>
              <strong>Plano atual:</strong> {currentPackage.name} — {currentPackage.status}
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Início: {new Date(currentPackage.startedAt).toLocaleDateString()}
                {currentPackage.endsAt
                  ? ` • Fim: ${new Date(currentPackage.endsAt).toLocaleDateString()}`
                  : ' • Sem data de fim'}
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.7, marginBottom: 8 }}>Sem plano atual.</div>
          )}

          {packageHistory && packageHistory.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {packageHistory.map((p) => (
                <li key={p.id}>
                  {p.name} — {p.status}{' '}
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    ({new Date(p.startedAt).toLocaleDateString()}
                    {p.endsAt ? ` → ${new Date(p.endsAt).toLocaleDateString()}` : ''})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* PT: planos de treino (resumo) */}
      {plans && plans.length > 0 && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Planos de treino</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {plans.map((pl) => (
              <li key={pl.id}>
                <strong>{pl.title}</strong>
                {pl.status ? ` — ${pl.status}` : ''}
                {pl.updatedAt && (
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    {' '}
                    • Atualizado em {new Date(pl.updatedAt).toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PT: antropometria */}
      {anthropometry && anthropometry.length > 0 && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Antropometria</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {anthropometry.map((a) => (
              <li key={a.id}>
                {new Date(a.takenAt).toLocaleDateString()}
                {typeof a.weightKg === 'number' ? ` • Peso: ${a.weightKg} kg` : ''}
                {typeof a.bodyFatPct === 'number' ? ` • GC: ${a.bodyFatPct}%` : ''}
                {a.notes ? ` • ${a.notes}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PT: notas */}
      {notes && notes.length > 0 && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Notas do Personal Trainer</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {notes.map((n) => (
              <li key={n.id}>
                <strong>{n.author}</strong>{' '}
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ({new Date(n.createdAt).toLocaleString()})
                </span>
                : {n.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PT: sessões futuras/passadas */}
      {sessions && sessions.length > 0 && (
        <section className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Sessões</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {sessions.map((s) => (
              <li key={s.id}>
                {new Date(s.startsAt).toLocaleString()} • {s.durationMin} min
                {s.title ? ` — ${s.title}` : ''}
                {s.location ? ` — ${s.location}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
