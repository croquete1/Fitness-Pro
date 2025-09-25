'use client';
import * as React from 'react';
import { Card, CardContent, CardActions, Button, Typography, Chip, Stack } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

export default function QuestionOfTheDayCard(
  { lastCore, lastDate, todayCore }:
  { lastCore: string | null; lastDate: string | null; todayCore: string | null }
) {
  const d = lastDate ? new Date(lastDate) : null;
  const isYesterday = d ? (new Date().getTime() - d.getTime()) < 48*3600*1000 : false;

  const question =
    isYesterday && lastCore ? `Como correu o exercício core de ontem (${lastCore})?` :
    todayCore ? `Hoje vamos focar em ${todayCore}. Como te sentes?` :
    'Como te sentes hoje?';

  const [today, setToday] = React.useState<{ answer?: 'ok'|'difficult' } | null>(null);
  const answered = !!today?.answer;

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/clients/checkin', { cache: 'no-store' }); // ✅ caminho novo
        const j = res.ok ? await res.json() : { item: null };
        setToday(j.item);
      } catch { setToday(null); }
    })();
  }, []);

  async function send(answer: 'ok'|'difficult') {
    try {
      const res = await fetch('/api/clients/checkin', { // ✅ caminho novo
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({ answer, question })
      });
      if (!res.ok) throw new Error(await res.text());
      setToday({ answer });
      toast(answer === 'ok' ? 'Boa! 🚀' : 'Percebido. Vamos ajustar! 🛠️', 2200, answer === 'ok' ? 'success' : 'warning');
    } catch {
      toast('Não foi possível registar agora', 2200, 'error');
    }
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ opacity:.7 }}>Pergunta do dia 💬</Typography>
          {answered && <Chip size="small" color="success" label="Registado" />}
        </Stack>
        <Typography variant="h6" fontWeight={700} sx={{ mt: .5 }}>{question}</Typography>
      </CardContent>
      <CardActions sx={{ px:2, pb:2 }}>
        <Button disabled={answered} onClick={() => send('ok')}>👍 Correu bem</Button>
        <Button disabled={answered} onClick={() => send('difficult')}>⚠️ Tive dificuldade</Button>
      </CardActions>
    </Card>
  );
}
