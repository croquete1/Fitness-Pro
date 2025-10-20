// src/app/(app)/dashboard/pt/settings/folgas/FolgaForm.tsx
'use client';

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type FeedbackState = { tone: 'success' | 'danger'; message: string };

export default function FolgaForm() {
  const sb = supabaseBrowser();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const feedbackId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setFeedback(null);

    try {
      const { data: auth } = await sb.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        setFeedback({ tone: 'danger', message: 'Sessão inválida. Inicia sessão novamente.' });
        return;
      }

      const { error } = await sb.from('pt_days_off').insert({
        trainer_id: uid,
        date: date || null,
        start_time: startTime || null,
        end_time: endTime || null,
        reason: reason || null,
      });

      if (error) {
        setFeedback({ tone: 'danger', message: error.message || 'Não foi possível registar a folga.' });
        return;
      }

      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      setFeedback({ tone: 'success', message: 'Folga adicionada com sucesso.' });
      router.refresh();
    } catch (error) {
      console.error('[pt-days-off] failed to create day off', error);
      setFeedback({ tone: 'danger', message: 'Erro inesperado ao registar a folga.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="pt-days-off-form neo-stack neo-stack--md" onSubmit={onSubmit} noValidate aria-describedby={feedback ? feedbackId : undefined}>
      <p className="pt-days-off-form__hint">Define uma data obrigatória e, opcionalmente, restringe o intervalo horário ou acrescenta um motivo.</p>

      <div className="pt-days-off-form__grid">
        <div className="neo-input-group">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Data</span>
            <input
              type="date"
              className="neo-input"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>

        <div className="pt-days-off-form__row">
          <div className="neo-input-group">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Início (opcional)</span>
              <input
                type="time"
                className="neo-input"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </label>
          </div>
          <div className="neo-input-group">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Fim (opcional)</span>
              <input
                type="time"
                className="neo-input"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="neo-input-group pt-days-off-form__reason">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Motivo (opcional)</span>
            <textarea
              rows={3}
              className="neo-input neo-input--textarea"
              placeholder="Ex.: férias, formação, indisponibilidade…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="pt-days-off-form__footer">
        <div className="pt-days-off-form__feedback" aria-live="polite" id={feedbackId}>
          {feedback ? (
            <div className="neo-alert" data-tone={feedback.tone}>
              <div className="neo-alert__content">
                <p className="neo-alert__message">{feedback.message}</p>
              </div>
            </div>
          ) : null}
        </div>
        <Button type="submit" variant="primary" loading={busy} loadingText="A registar…">
          Adicionar folga
        </Button>
      </div>
    </form>
  );
}
