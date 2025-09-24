'use client';
import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

export default function TaskListCard({ title='Tarefas do dia', items }: { title?: string; items: string[] }) {
  const [done, setDone] = React.useState<Record<number, boolean>>({});
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title={title} />
      <CardContent>
        <List dense disablePadding>
          {items.map((t, i) => (
            <ListItem key={i} disableGutters
              secondaryAction={<Checkbox edge="end" checked={!!done[i]} onChange={()=>setDone(s=>({ ...s, [i]: !s[i] }))} />}
            >
              <Typography sx={{ pr: 1, opacity: done[i] ? .6 : 1, textDecoration: done[i] ? 'line-through' : 'none' }}>{t}</Typography>
            </ListItem>
          ))}
          {items.length===0 && <Typography sx={{ opacity:.7 }}>Sem tarefas.</Typography>}
        </List>
      </CardContent>
    </Card>
  );
}
