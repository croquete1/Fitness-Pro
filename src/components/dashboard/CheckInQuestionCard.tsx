// src/components/dashboard/CheckInQuestionCard.tsx
'use client';
import * as React from 'react';
import { toast } from '@/components/ui/Toaster';

export default function CheckInQuestionCard() {
  const [question, setQuestion] = React.useState<string>('');
  const [answer, setAnswer] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/clients/checkin', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(json => { if (!cancelled && json?.question) setQuestion(json.question); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!question) return null;

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
      <div className="text-sm font-semibold opacity-70 mb-2">Check-in rápido</div>
      <div className="text-sm mb-2">{question}</div>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!answer.trim()) return;
          try {
            await fetch('/api/clients/checkin', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ question, answer }),
            });
            toast('Obrigado! Feedback registado.');
            setAnswer('');
          } catch {
            toast('Não foi possível registar agora.');
          }
        }}
      >
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escreve aqui a tua resposta…"
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
        />
        <button
          type="submit"
          className="text-sm rounded-lg px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
