'use client';

import * as React from 'react';
import ExerciseForm, { type ExerciseFormMessages } from '@/components/exercise/ExerciseForm';
import { ExerciseFormValues } from '@/lib/exercises/schema';

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<ExerciseFormValues>;
  onSuccess?: () => void;
};

export default function AdminExerciseFormClient({ mode, initial, onSuccess }: Props) {
  const submit = React.useCallback(
    async (payload: ExerciseFormValues) => {
      let res: Response;
      if (mode === 'edit' && payload.id) {
        res = await fetch(`/api/admin/exercises/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            muscle_group: payload.muscle_group ?? null,
            equipment: payload.equipment ?? null,
            difficulty: payload.difficulty ?? null,
            description: payload.description ?? null,
            video_url: payload.video_url ?? null,
          }),
        });
      } else {
        res = await fetch('/api/admin/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            muscle_group: payload.muscle_group ?? null,
            equipment: payload.equipment ?? null,
            difficulty: payload.difficulty ?? null,
            description: payload.description ?? null,
            video_url: payload.video_url ?? null,
          }),
        });
      }

      if (!res.ok) {
        const message = (await res.text()) || 'Falha ao gravar exercício';
        throw new Error(message);
      }
    },
    [mode],
  );

  const messages: Partial<ExerciseFormMessages> = React.useMemo(
    () => ({ validationError: 'Verifique os campos destacados.' }),
    [],
  );

  return <ExerciseForm mode={mode} initial={initial} onSuccess={onSuccess} submit={submit} messages={messages} />;
}
