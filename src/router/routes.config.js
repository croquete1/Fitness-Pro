// src/router/routes.config.js

export const DASHBOARD_LABELS = {
  title: 'Painel de Administração',
  users: 'Utilizadores',
  usersDesc: 'Total de clientes registados',
  trainers: 'Personal Trainers',
  trainersDesc: 'Total de treinadores registados',
  pending: 'Pedidos Pendentes',
  pendingDesc: 'Solicitações à espera de revisão',
  feedback: 'Feedback',
  feedbackDesc: 'Mensagens dos utilizadores',
  notifications: 'Notificações',
  notificationsDesc: 'Notificações novas',
  activity: 'Atividade Mensal',
  activityDesc: 'Novos utilizadores por mês',
}

export const DASHBOARD_ROUTES = {
  adminDashboard: '/admin/dashboard',
  createNotification: '/admin/notificacoes/criar',
  clientDashboard: '/cliente/dashboard',
  trainerDashboard: '/trainer/dashboard',
}
