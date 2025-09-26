'use client';

import * as React from 'react';
import {
    Badge, IconButton, Menu, MenuItem, ListItemText, ListItemSecondaryAction, Tooltip
} from '@mui/material';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNone';
import CheckIcon from '@mui/icons-material/Check';
import SentimentSatisfiedOutlined from '@mui/icons-material/SentimentSatisfiedOutlined'; // Para o estado vazio

export default function HeaderBell() {
    const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
    // 💡 Estado de exemplo com dados simples
    const [items, setItems] = React.useState<Array<{ id: string; text: string; link?: string }>>([
        { id: '1', text: 'Sessão presencial hoje às 18:30', link: '/dashboard/sessions' },
        { id: '2', text: 'Plano atualizado pelo PT', link: '/dashboard/my-plan' },
    ]);

    const open = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
    const close = () => setAnchor(null);
    
    // Função para limpar uma notificação
    const clear = (id: string) => {
        setItems((xs) => xs.filter((x) => x.id !== id));
    };

    return (
        <>
            <Tooltip title="Notificações">
                <IconButton onClick={open} aria-label="Notificações">
                    <Badge badgeContent={items.length} color="primary">
                        <NotificationsNoneOutlined />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchor}
                open={!!anchor}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 300 } } }}
            >
                {/* Estado vazio otimizado com MUI */}
                {items.length === 0 && (
                    <MenuItem disabled sx={{ color: 'text.secondary' }}>
                        <SentimentSatisfiedOutlined sx={{ mr: 1, fontSize: 'small' }} />
                        <ListItemText primary="Nada novo por aqui" />
                    </MenuItem>
                )}
                
                {items.map((n) => (
                    <MenuItem 
                        key={n.id} 
                        // Se houver link, fechar o menu ao clicar
                        onClick={() => { if (n.link) close(); }}
                        sx={{ 
                            // O padding extra é agora opcional, pois o SecondaryAction está melhor contido
                            pr: 5 
                        }}
                    >
                        <ListItemText 
                            primary={n.text} 
                            primaryTypographyProps={{ 
                                noWrap: true,
                                // Adiciona um leve estilo para que pareça mais clicável se tiver um link
                                fontWeight: n.link ? 500 : 400 
                            }} 
                        />
                        
                        {/* 🚀 OTIMIZAÇÃO: Usar IconButton dentro do SecondaryAction */}
                        <ListItemSecondaryAction>
                            <Tooltip title="Marcar como lida">
                                <IconButton 
                                    size="small"
                                    edge="end" 
                                    onClick={(e) => {
                                        // Previne que o clique no botão ative o clique no MenuItem pai
                                        e.stopPropagation(); 
                                        clear(n.id);
                                    }}
                                    aria-label={`Marcar notificação ${n.id} como lida`}
                                >
                                    <CheckIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}