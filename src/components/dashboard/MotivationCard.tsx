'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

export default function MotivationCard() {
  const [quote, setQuote] = React.useState<{ text: string; author?: string | null } | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/motivations/today', { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        if (res.ok && json?.item) setQuote(json.item);
        else setQuote({ text: 'Foco, disciplina e consistência 💪', author: 'Fitness Pro' });
      } catch {
        if (alive) setQuote({ text: 'Foco, disciplina e consistência 💪', author: 'Fitness Pro' });
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        {!quote ? (
          <>
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </>
        ) : (
          <>
            <Typography variant="subtitle2" sx={{ opacity:.7, mb:.5 }}>Frase do dia</Typography>
            <Typography variant="h6" sx={{ fontWeight:800, lineHeight:1.25, mb:.5 }}>
              “{quote.text}”
            </Typography>
            {quote.author && <Typography variant="body2" sx={{ opacity:.8 }}>— {quote.author}</Typography>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
