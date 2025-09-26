'use client';

import * as React from 'react';
import { Paper, Stack, Typography, Chip } from '@mui/material';
import AccessTime from '@mui/icons-material/AccessTime';
import PersonOutline from '@mui/icons-material/PersonOutline';
import FitnessCenter from '@mui/icons-material/FitnessCenter';

type Props = {
  session: null | {
    id: string;
    title: string;
    start_at: string;
    end_at: string | null;
    kind: string | null;
    status: string | null;
    trainer: string | null;
  };
};

export default function ClientDailyCard({ session }: Props) {
  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      {!session ? (
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={800}>Treino do dia</Typography>
          <Typography variant="body2" color="text.secondary">
            Não tens sessão marcada para hoje. Podes aproveitar para mobilidade, alongamentos ou descanso ativo. 🧘‍♂️
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FitnessCenter fontSize="small" />
            <Typography variant="subtitle1" fontWeight={800}>Treino do dia</Typography>
          </Stack>
          <Typography variant="h6" fontWeight={800}>{session.title}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" icon={<AccessTime />} label={new Date(session.start_at).toLocaleTimeString()} />
            {session.trainer && <Chip size="small" icon={<PersonOutline />} label={`PT: ${session.trainer}`} />}
            {session.kind && <Chip size="small" label={String(session.kind)} />}
            {session.status && <Chip size="small" label={String(session.status)} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Boa sessão! Mantém a técnica, controla a respiração e regista como te sentiste no fim. ✍️
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
