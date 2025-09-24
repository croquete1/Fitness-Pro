// src/components/dashboard/MotivationCard.tsx
'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function MotivationCard() {
  const [phrase, setPhrase] = React.useState<{ id: string; text: string; author?: string | null } | null>(null);

  React.useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await fetch('/api/motivation/today', { cache: 'no-store' });
        if (ok && res.ok) {
          const json = await res.json();
          setPhrase(json?.phrase ?? null);
        }
      } catch {}
    })();
    return () => { ok = false; };
  }, []);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title="Motivação do dia" subheader="Nova frase todos os dias ✨" />
      <CardContent>
        {!phrase && <Typography variant="body2">A carregar…</Typography>}
        {phrase && (
          <>
            <Typography variant="h6" sx={{ mb: .5 }}>“{phrase.text}”</Typography>
            {phrase.author && <Typography variant="body2" sx={{ opacity: .7 }}>— {phrase.author}</Typography>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
