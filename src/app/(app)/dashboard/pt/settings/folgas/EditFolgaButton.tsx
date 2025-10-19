// src/app/(app)/dashboard/pt/settings/folgas/EditFolgaButton.tsx
'use client';

import React, { useEffect, useId, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Props = { folgaId: string };

type Folga = {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

type FeedbackState = { tone: 'success' | 'danger'; message: string };

export default function EditFolgaButton({ folgaId }: Props) {
  const sb = supabaseBrowser();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const dialogTitleId = useId();
  const feedbackId = useId();

  useEffect(() => {
    if (!open) return;

    let active = true;
    setInitializing(true);
    setFeedback(null);

    (async () => {
      const { data, error } = await sb
        .from('pt_days_off')
        .select('id, trainer_id, date, start_time, end_time, reason')
        .eq('id', folgaId)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setFeedback({ tone: 'danger', message: error?.message || 'Não foi possível carregar a folga.' });
        return;
      }

      const record = data as Folga;
      setDate(record.date ?? '');
      setStartTime(record.start_time ?? '');
      setEndTime(record.end_time ?? '');
      setReason(record.reason ?? '');
    })()
      .catch((error) => {
        console.error('[pt-days-off] failed to load day off', error);
        if (active) setFeedback({ tone: 'danger', message: 'Erro inesperado ao carregar a folga.' });
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [open, folgaId, sb]);

  const busy = initializing || saving || deleting;

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setSaving(true);
    setFeedback(null);

    try {
      const { error } = await sb
        .from('pt_days_off')
        .update({
          date: date || null,
          start_time: startTime || null,
          end_time: endTime || null,
          reason: reason || null,
        })
        .eq('id', folgaId);

      if (error) {
        setFeedback({ tone: 'danger', message: error.message || 'Não foi possível guardar a folga.' });
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('[pt-days-off] failed to update day off', error);
      setFeedback({ tone: 'danger', message: 'Erro inesperado ao guardar alterações.' });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (busy) return;
    if (typeof window !== 'undefined' && !window.confirm('Eliminar esta folga?')) {
      return;
    }

    setDeleting(true);
    setFeedback(null);

    try {
      const { error } = await sb.from('pt_days_off').delete().eq('id', folgaId);
      if (error) {
        setFeedback({ tone: 'danger', message: error.message || 'Não foi possível eliminar a folga.' });
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('[pt-days-off] failed to delete day off', error);
      setFeedback({ tone: 'danger', message: 'Erro inesperado ao eliminar a folga.' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Editar
      </Button>

      {open && (
        <div
          className="neo-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={feedback ? feedbackId : undefined}
        >
          <div className="neo-dialog pt-days-off__dialog">
            <header className="neo-dialog__header">
              <h2 id={dialogTitleId} className="neo-dialog__title">
                Editar folga
              </h2>
              <button
                type="button"
                className="neo-icon-button"
                onClick={() => (!busy ? setOpen(false) : undefined)}
                aria-label="Fechar"
                disabled={busy}
              >
                <X size={16} />
              </button>
            </header>

            <div className="neo-dialog__content pt-days-off__dialogContent">
              {initializing ? (
                <div className="pt-days-off__dialogLoading" aria-live="polite">
                  <span className="neo-spinner" aria-hidden />
                  <p>A carregar detalhes da folga…</p>
                </div>
              ) : (
                <form className="pt-days-off-form neo-stack neo-stack--md" onSubmit={onSave}>
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
                          disabled={busy}
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
                            disabled={busy}
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
                            disabled={busy}
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
                          placeholder="Ex.: férias, formação…"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          disabled={busy}
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
                    <div className="pt-days-off__dialogActions">
                      <Button
                        type="button"
                        variant="danger"
                        loading={deleting}
                        onClick={onDelete}
                        leftIcon={<Trash2 size={16} />}
                      >
                        Eliminar
                      </Button>
                      <Button type="submit" variant="primary" loading={saving} loadingText="A guardar…">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
