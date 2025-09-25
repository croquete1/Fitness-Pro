'use client';
import * as React from 'react';
import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';

type SessionLike = { title?: string | null; items?: string[] | null };

const fallback: Record<number, { titulo: string; itens: string[] }> = {
  0: { titulo: 'Recuperação Ativa', itens: ['Caminhada 30–45min', 'Mobilidade 10min', 'Alongamentos leves'] },
  1: { titulo: 'Perna/Glúteo (A)', itens: ['Agachamento guiado 4x10-12', 'Leg press 4x12', 'Hip thrust 4x12', 'Abdutor 3x15'] },
  2: { titulo: 'Peito/Ombro/Tríceps', itens: ['Supino máquina 4x10', 'Remada alta 3x12', 'Elevações laterais 3x15', 'Tríceps polia 3x12'] },
  3: { titulo: 'Mobilidade & Core', itens: ['Mob anca 10min', 'Prancha 3x40s', 'Dead bug 3x12', 'Bird-dog 3x12'] },
  4: { titulo: 'Perna/Glúteo (B)', itens: ['Búlgaro 3x12', 'RDL 4x10', 'Extensora 3x15', 'Panturrilha 4x15'] },
  5: { titulo: 'Costas/Bíceps', itens: ['Puxada 4x10', 'Remada máquina 4x10-12', 'Rosca bíceps 3x12', 'Face pull 3x15'] },
  6: { titulo: 'Full Body', itens: ['Leg press 3x12', 'Puxada 3x12', 'Supino 3x12', 'Prancha 3x40s'] },
};

export default function TreinoDoDiaCard({ session }: { session?: SessionLike }) {
  const [data, setData] = React.useState<{ titulo: string; itens: string[] } | null>(null);

  React.useEffect(() => {
    if (session?.title || (session?.items?.length ?? 0) > 0) {
      setData({
        titulo: session.title || 'Treino do dia',
        itens: (session.items && session.items.length ? session.items : []) as string[],
      });
    } else {
      const d = new Date().getDay();
      setData(fallback[d] ?? fallback[1]);
    }
  }, [session]);

  if (!data) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity:.7, mb:.5 }}>Treino do dia 💪</Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{data.titulo}</Typography>
        <List dense sx={{ pt: 0 }}>
          {data.itens.map((i, idx) => (
            <ListItem key={idx} sx={{ py: .25, px: 0 }}>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={`• ${i}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
