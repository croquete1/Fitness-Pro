'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';

type Res = { type: string; items: { id: string; title: string; subtitle?: string; href?: string }[] };

export default function HeaderSearch() {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const [groups, setGroups] = React.useState<Res[]>([]);
  const router = useRouter();
  const ref = React.useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => { if (ref.current) setAnchor(ref.current); }, []);

  React.useEffect(() => {
    const id = setTimeout(async () => {
      const term = q.trim();
      if (!term) { setGroups([]); setOpen(false); return; }
      const r = await fetch('/api/search?q=' + encodeURIComponent(term), { cache: 'no-store' });
      const j = await r.json();
      const arr = (j?.results || []).filter((g: Res) => g.items?.length);
      setGroups(arr);
      setOpen(true);
    }, 180);
    return () => clearTimeout(id);
  }, [q]);

  function goAll() {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push('/dashboard/search?q=' + encodeURIComponent(term));
  }

  return (
    <>
      <OutlinedInput
        inputRef={ref}
        size="small"
        placeholder="Pesquisar…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim() && setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') goAll(); }}
        sx={(t) => ({
          width: '100%',
          '& .MuiOutlinedInput-input': { py: 1 },
          bgcolor: t.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.04)',
          '&:hover': {
            bgcolor: t.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
          },
        })}
        startAdornment={
          <InputAdornment position="start" sx={{ pl: 0.5 }}>
            <SearchIcon fontSize="small" />
          </InputAdornment>
        }
      />

      <Popper
        open={open}
        anchorEl={anchor}
        placement="bottom-start"
        style={{ zIndex: 1400, width: isSm ? 'calc(100vw - 16px)' : undefined }}
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      >
        <Paper
          variant="outlined"
          sx={{
            width: isSm ? 'calc(100vw - 16px)' : 440,
            maxHeight: 360,
            overflow: 'auto',
            borderRadius: 2,
          }}
        >
          <List dense disablePadding>
            {groups.map((g) => (
              <li key={g.type}>
                <ul>
                  <ListSubheader disableSticky sx={{ bgcolor: 'background.paper' }}>
                    {g.type === 'users' ? 'Utilizadores'
                      : g.type === 'plans' ? 'Planos'
                      : g.type === 'sessions' ? 'Sessões'
                      : g.type === 'messages' ? 'Mensagens'
                      : g.type}
                  </ListSubheader>
                  {g.items.map((it) => (
                    <ListItem key={it.id} disablePadding>
                      <ListItemButton onClick={() => { setOpen(false); router.push(it.href || '/dashboard/search?q=' + encodeURIComponent(q)); }}>
                        <ListItemText
                          primary={it.title}
                          secondary={it.subtitle}
                          primaryTypographyProps={{ noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </ul>
              </li>
            ))}
            {groups.length === 0 && (
              <ListItem><ListItemText primary="Sem resultados." /></ListItem>
            )}
            <ListItem>
              <ListItemButton onClick={goAll}>
                <ListItemText primary={`Ver todos os resultados para “${q}”`} />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Popper>
    </>
  );
}
