'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import {
    Box,
    Paper,
    Stack,
    Typography,
    IconButton,
    TextField,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Divider,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import KpiCard from '@/components/ui/KpiCard';

// Função utilitária para a saudação
function greeting(now = new Date()) {
    const h = now.getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 20) return 'Boa tarde';
    return 'Boa noite';
}

type Task = { id: string; text: string; done: boolean };

const STORAGE_KEY = 'admin.tasks.today';

export default function AdminDashboardPage() {
    // Nota: O nome deve vir do contexto de autenticação/sessão, mas mantive o useState para simulação.
    const [name] = React.useState<string | undefined>(undefined); 
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [input, setInput] = React.useState('');

    // Efeitos para carregar e persistir as tarefas no LocalStorage
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setTasks(JSON.parse(raw));
            } else {
                // seed inicial
                setTasks([
                    { id: crypto.randomUUID(), text: 'Rever pedidos de aprovação ✅', done: false },
                    { id: crypto.randomUUID(), text: 'Validar backups e logs 🧰', done: false },
                    { id: crypto.randomUUID(), text: 'Criar contas para novos PTs 🧑‍🏫', done: false },
                ]);
            }
        } catch (e) {
            console.error('Failed to load tasks from local storage', e);
        }
    }, []);
    
    React.useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to local storage', e);
        }
    }, [tasks]);

    // Lógica de manipulação de tarefas
    const addTask = () => {
        const t = input.trim();
        if (!t) return;
        setTasks((xs) => [{ id: crypto.randomUUID(), text: t, done: false }, ...xs]);
        setInput('');
    };
    const toggleTask = (id: string) =>
        setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    const removeTask = (id: string) => setTasks((xs) => xs.filter((x) => x.id !== id));
    
    const editTask = (id: string) => {
        const next = prompt('Editar tarefa:', tasks.find((t) => t.id === id)?.text || '');
        if (next && next.trim()) {
            setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, text: next.trim() } : x)));
        }
    };

    return (
        <Stack spacing={3}>
            {/* Saudação (Greeting) */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Typography variant="h6" fontWeight={800}>
                    {greeting()} {name ? `, ${name}` : '👋'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Bem-vindo ao painel de administração. Aqui tens um resumo e as ações rápidas de hoje.
                </Typography>
            </Paper>

            {/* KPIs */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard title="Utilizadores" value={128} delta={3.2} sparkData={[110, 112, 114, 118, 121, 124, 128]} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard title="Planos ativos" value={64} delta={-1.8} sparkData={[70, 69, 68, 67, 66, 65, 64]} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard title="Novos registos" value={12} delta={5.0} sparkData={[6, 7, 8, 9, 10, 11, 12]} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard title="Erros sistema" value={0} delta={0} />
                </Grid>
            </Grid>

            {/* Tarefas do dia (Com persistência e responsividade otimizada) */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {/* Cabeçalho e Input de Tarefa - Otimizado para responsividade */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    sx={{ mb: 1, gap: { xs: 1.5, sm: 2 } }}
                >
                    <Typography variant="subtitle1" fontWeight={800}>Tarefas de Administração</Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Nova tarefa…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                            sx={{ minWidth: { sm: 280 } }}
                        />
                        <Button onClick={addTask} variant="contained" startIcon={<AddIcon />} disableElevation>
                            Adicionar
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <List dense disablePadding>
                    {tasks.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            Nada a fazer agora. Aproveita para rever métricas ou aprovações. ✨
                        </Typography>
                    )}
                    {tasks.map((t) => (
                        <ListItem
                            key={t.id}
                            secondaryAction={
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Editar">
                                        <IconButton edge="end" aria-label="Editar" onClick={() => editTask(t.id)}>
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Apagar">
                                        <IconButton edge="end" aria-label="Apagar" onClick={() => removeTask(t.id)}>
                                            <DeleteOutline fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            }
                            sx={{
                                px: 1,
                                borderRadius: 1.5,
                                '& + &': { mt: 0.5 },
                                bgcolor: t.done ? 'action.selected' : 'transparent',
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                    edge="start"
                                    checked={t.done}
                                    onChange={() => toggleTask(t.id)}
                                    // Usando CheckCircleOutline para um look mais clean
                                    icon={<CheckCircleOutline fontSize="small" />}
                                    checkedIcon={<CheckCircleOutline color="primary" fontSize="small" />}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={t.text}
                                primaryTypographyProps={{
                                    sx: { textDecoration: t.done ? 'line-through' : 'none' },
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Stack>
    );
}