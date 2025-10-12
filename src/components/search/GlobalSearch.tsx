'use client';

import * as React from 'react';
import {
  Box, ClickAwayListener, CircularProgress, Divider, InputAdornment, List, ListItemButton,
  ListItemIcon, ListItemText, Paper, Popper, TextField, Typography, Button, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import FitnessCenterOutlined from '@mui/icons-material/FitnessCenterOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/navigation';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';
type Item = { id: string; type: string; title: string; subtitle?: string | null; href?: string };

const GROUP_ORDER = ['user', 'client', 'trainer', 'session', 'plan', 'exercise', 'trainer_info'] as const;
const GROUP_LABEL: Record<string, string> = {
  user: 'Utilizadores',
  client: 'Clientes',
  trainer: 'Personal Trainers',
  session: 'Sessões',
  plan: 'Planos',
  exercise: 'Exercícios',
  trainer_info: 'Personal Trainer atribuído',
};

const GROUP_ICON: Record<string, React.ReactNode> = {
  user: <GroupOutlined fontSize="small" />,
  client: <GroupOutlined fontSize="small" />,
  trainer: <PersonOutline fontSize="small" />,
  session: <CalendarMonthOutlined fontSize="small" />,
  plan: <ListAltOutlined fontSize="small" />,
  exercise: <FitnessCenterOutlined fontSize="small" />,
  trainer_info: <PersonOutline fontSize="small" />,
};

function groupItems(items: Item[]) {
  const map: Record<string, Item[]> = {};
  for (const it of items) {
    const key = it.type;
    if (!map[key]) map[key] = [];
    map[key].push(it);
  }
  // ordena por GROUP_ORDER e filtra grupos vazios
  return GROUP_ORDER.map(g => ({ key: g, items: map[g] ?? [] })).filter(g => g.items.length > 0);
}

function rolePlaceholder(role: Role) {
  if (role === 'ADMIN') return 'Pesquisar utilizadores/planos/sessões/exercícios… 🔎';
  if (role === 'TRAINER') return 'Pesquisar clientes/exercícios/planos que acompanho… 🔎';
  return 'Pesquisar exercícios/planos/sessões… 🔎';
}

function moreHrefFor(role: Role, groupKey: string, q: string) {
  // “Ver mais” abre a página mais natural para cada grupo/role
  if (role === 'ADMIN') {
    if (groupKey === 'user' || groupKey === 'client' || groupKey === 'trainer') return `/dashboard/admin/users?q=${encodeURIComponent(q)}`;
    if (groupKey === 'exercise') return `/dashboard/admin/exercises?q=${encodeURIComponent(q)}`;
    if (groupKey === 'plan') return `/dashboard/admin/plans?q=${encodeURIComponent(q)}`;
    if (groupKey === 'session') return `/dashboard/admin/pts-schedule?q=${encodeURIComponent(q)}`;
  }
  if (role === 'TRAINER') {
    if (groupKey === 'client') return `/dashboard/pt/clients?q=${encodeURIComponent(q)}`;
    if (groupKey === 'exercise') return `/dashboard/admin/exercises?q=${encodeURIComponent(q)}`;
    if (groupKey === 'plan') return `/dashboard/pt/my-plan?q=${encodeURIComponent(q)}`;
    if (groupKey === 'session') return `/dashboard/pt/sessions?q=${encodeURIComponent(q)}`;
  }
  // CLIENT
  if (groupKey === 'exercise') return `/dashboard/my-plan?q=${encodeURIComponent(q)}`;
  if (groupKey === 'plan') return `/dashboard/my-plan?q=${encodeURIComponent(q)}`;
  if (groupKey === 'session') return `/dashboard/sessions?q=${encodeURIComponent(q)}`;
  if (groupKey === 'trainer_info') return `/dashboard/profile?q=${encodeURIComponent(q)}`;
  return `/dashboard/search?q=${encodeURIComponent(q)}`;
}

export default function GlobalSearch({ role = 'ADMIN' as Role }: { role?: Role }) {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const timer = React.useRef<any>(null);

  const placeholder = rolePlaceholder(role);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const fetchData = React.useCallback((term: string) => {
    if (!term.trim()) { setItems([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(term)}&limit=12`, { credentials: 'include' })
      .then(r => r.json())
      .then(j => { setItems(Array.isArray(j.items) ? j.items : []); })
      .catch(() => { setItems([]); })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (v: string) => {
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchData(v), 250);
  };

  const onPick = (it: Item) => {
    setOpen(false);
    if (it.href) router.push(it.href);
  };

  const groups = groupItems(items);
  const hasResults = groups.length > 0;

  return (
    <Box ref={anchorRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? <CircularProgress size={16} /> : <SearchIcon fontSize="small" />}
            </InputAdornment>
          ),
        }}
        aria-label="Pesquisa global"
      />

      <Popper open={open && (!!q || hasResults)} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: 1500 }}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper elevation={8} sx={{ mt: 1, width: anchorRef.current?.offsetWidth || 420, borderRadius: 2, overflow: 'hidden' }}>
            {!hasResults ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                {q ? 'Sem resultados.' : 'Escreve para pesquisar…'}
              </Typography>
            ) : (
              <Box>
                {groups.map((g, gi) => {
                  const limit = 5; // mostra até 5 por grupo
                  const headIcon = GROUP_ICON[g.key] ?? <InfoOutlined fontSize="small" />;
                  const moreHref = moreHrefFor(role, g.key, q);

                  return (
                    <Box key={g.key}>
                      {gi > 0 && <Divider />}
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.25, pt: 1 }}>
                        {headIcon}
                        <Typography variant="overline" color="text.secondary">{GROUP_LABEL[g.key] ?? g.key}</Typography>
                        <Box sx={{ flex: 1 }} />
                        {g.items.length > limit && (
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIos fontSize="inherit" />}
                            onClick={() => { setOpen(false); router.push(moreHref); }}
                          >
                            Ver mais
                          </Button>
                        )}
                      </Stack>

                      <List dense disablePadding>
                        {g.items.slice(0, limit).map((it, i) => (
                          <React.Fragment key={`${g.key}-${it.id}-${i}`}>
                            <ListItemButton onClick={() => onPick(it)}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {GROUP_ICON[g.key] ?? <DashboardOutlined fontSize="small" />}
                              </ListItemIcon>
                              <ListItemText
                                primary={it.title}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }}
                                secondary={it.subtitle || undefined}
                              />
                            </ListItemButton>
                            {i < Math.min(limit, g.items.length) - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
