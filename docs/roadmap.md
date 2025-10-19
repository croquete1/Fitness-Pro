# Roadmap Verificado

Este documento rastreia o estado actual das tarefas priorizadas identificadas na auditoria técnica anterior. Cada item inclui a situação actual na base de código.

## Fase 1 - Correções Imediatas
- [x] Alinhar método HTTP e normalizar estados na aprovação/suspensão de utilizadores (`POST`/`PATCH` aceites e alias `DISABLED` mapeado). Fonte: `src/app/api/admin/users/[id]/status/route.ts`.
- [x] Proteger a exportação CSV de utilizadores com guarda de administrador. Fonte: `src/app/api/admin/users.csv/route.ts`.
- [x] Implementar listagem de utilizadores com filtros, paginação e normalização de campos (`rows`/`count`). Fonte: `src/app/api/admin/users/route.ts`.
- [x] Permitir edição e remoção directa de utilizadores por ID com validação de role/status. Fonte: `src/app/api/admin/users/[id]/route.ts`.
- [x] Uniformizar rotas e navegação da área de PT (prefixo único `/dashboard/pt` com legados a redirecionar).
- [x] Limpar código legado da transição Prisma→Supabase e definir fonte única de verdade para utilizadores (repositório `userRepo` centraliza contagens/leituras e endpoints deixaram de actualizar `profiles`).
- [x] Activar logging/auditoria em todas as acções críticas (criação/edição/estado/role/bulk aprovações agora registam eventos em `audit_logs`).
- [x] Melhorar feedback de UI e tratamento de erros silenciosos (login/registo agora validam com mensagens contextuais e toasts consistentes). Fontes: `src/app/login/page.tsx`, `src/app/register/RegisterClient.tsx`.
- [x] Realizar passagem de testes E2E cobrindo fluxo completo de registo→aprovação→dashboard (primeira suite Playwright validando o fluxo de autenticação/log-in). Fontes: `playwright.config.ts`, `tests/e2e/login.spec.ts`.
- [x] Garantir que NextAuth expõe `id`/`role` nas sessões JWT e os guards deixam de responder 401 injustificados. Fontes: `src/lib/authOptions.ts`, `src/lib/authServer.ts`, `src/lib/session-bridge.ts`.
- [x] Restaurar a sidebar única com navegação PT completa, rótulos visíveis e toggle de tema funcional (eliminação de duplicados nos layouts e actualização do `ThemeToggleButton`). Fontes: `src/components/layout/DashboardFrame.tsx`, `src/components/layout/RoleSidebar.tsx`, `src/components/layout/SidebarPT.tsx`, `src/components/theme/ThemeToggleButton.tsx`.
- [x] Evitar falhas de build/deploy quando as variáveis do Supabase estão em falta (inicialização lazy e respostas 503 amigáveis). Fontes: `src/lib/supabaseServer.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/responses.ts`, `src/app/(app)/dashboard/pt/summary/route.ts`, `src/app/api/register/route.ts`, `src/app/api/me/route.ts`, `src/app/api/admin/clients/route.ts`, `src/app/api/trainer/pts-schedule/route.ts`.
- [x] Expandir os fallbacks das APIs Supabase para devoluções vazias seguras durante o build (clientes, PTs, agendas, utilizadores, motivações). Fontes: `src/lib/supabase/responses.ts`, `src/app/api/admin/options/{clients,trainers}/route.ts`, `src/app/api/admin/users/route.ts`, `src/app/api/admin/pts-schedule/*`, `src/app/api/admin/motivations/*`, `src/app/api/trainer/pts-schedule/*`.
- [x] Actualizar a apresentação de utilizadores para incluir estado online, últimos acessos e CSV/print alinhados com os novos campos. Fontes: `src/app/api/admin/users/route.ts`, `src/app/(app)/dashboard/admin/users/users.client.tsx`.
- [x] Redireccionar a lista de utilizadores do admin para o perfil detalhado do cliente ao clicar no nome. Fonte: `src/app/(app)/dashboard/admin/users/users.client.tsx`.
- [x] Modernizar o painel inicial do admin com greeting contextual, métricas dinâmicas e gestão de frases motivadoras integrada. Fontes: `src/app/(app)/dashboard/admin/page.tsx`, `src/app/(app)/dashboard/admin/AdminDashboardClient.tsx`, `src/components/admin/MotivationAdminCard.tsx`.
- [x] Centralizar o branding no header e simplificar sidebars para um look mais limpo (apenas indicadores abstractos na navegação lateral). Fontes: `src/components/layout/AppHeader.tsx`, `src/components/layout/SidebarAdmin.tsx`, `src/components/layout/SidebarClient.tsx`, `src/components/layout/SidebarPT.tsx`.
- [x] Recriar o login/registo com branding HMS, fundo gradiente e copy unificada. Fontes: `src/app/login/LoginClient.tsx`, `src/app/register/RegisterClient.tsx`.
- [x] Normalizar o menu do header (perfil, tema, terminar sessão) e tornar a pesquisa sempre acessível. Fonte: `src/components/layout/AppHeader.tsx`.
- [x] Disponibilizar pesquisa global no header com resultados para utilizadores/sessões/aprovações e fallback offline, agora com painel `.neo` dedicado, métricas reais do Supabase e dataset determinístico. Fontes: `src/components/layout/AppHeader.tsx`, `src/app/(app)/dashboard/search/page.tsx`, `src/app/(app)/dashboard/search/search.client.tsx`, `src/app/api/search/route.ts`, `src/lib/search/{dashboard,server}.ts`, `src/lib/fallback/search.ts`.
- [x] Reestruturar os dashboards de admin e PT em componentes client-friendly para eliminar erros de serialização e garantir responsividade. Fontes: `src/app/(app)/dashboard/admin/AdminDashboardClient.tsx`, `src/app/(app)/dashboard/trainer/TrainerDashboardClient.tsx`, `src/app/(app)/dashboard/trainer/page.tsx`.
- [x] Endurecer o endpoint de planos administrativos com guarda de administrador e fallbacks Supabase. Fonte: `src/app/api/admin/plans/route.ts`.
- [x] Modernizar a ficha detalhada de clientes/utentes com overview completo, métricas e gestão de PT em cartão único. Fontes: `src/app/(app)/dashboard/users/[id]/page.tsx`, `src/app/(app)/dashboard/users/[id]/profile.client.tsx`.
- [x] Reforçar pesquisas/admin lookup para usar Supabase directamente (com fallbacks) e desbloquear atribuição de PTs. Fontes: `src/app/api/admin/lookup/people/route.ts`, `src/app/api/search/{clients,trainer}/route.ts`, `src/app/api/admin/assign-pt/route.ts`.
- [x] Remover dependências Prisma remanescentes substituindo-as por integrações Supabase e scripts actualizados. Fontes: `src/lib/events.ts`, `src/lib/planLog.ts`, `scripts/{create-admin,promote-admin,reset-password}.mjs`.
- [x] Ajustar o layout do dashboard para ocupar toda a largura e responder melhor a todos os breakpoints. Fontes: `src/components/layout/DashboardFrame.tsx` e páginas `dashboard/*` com `Container maxWidth={false}`.

## Fase 2 - Melhorias Estruturais
- [ ] Validar carregamento real da lista de utilizadores/aprovações no Supabase (remoção dos fallbacks quando a API estiver estável e seeds completos).
- [ ] Harmonizar o toggle de tema (cookies + localStorage) para eliminar flashes e estados mistos no login.
- [ ] Migrar toda a consola administrativa para o design system `.neo`, consolidando tabelas, filtros e quick actions (aprovações, centro de notificações do utilizador, onboarding, histórico, roster e agora a gestão de utilizadores em `/dashboard/users` já convertidos).
- [x] Recriar o painel de métricas do cliente no tema `.neo`, com integração Supabase, filtros temporais e gráficos interactivos (src/app/(app)/dashboard/clients/metrics/**/*).
- [x] Reimaginar o módulo de sessões do cliente no tema `.neo`, com métricas, timeline, ranking de PT e gestão de pedidos ligada ao Supabase (src/app/(app)/dashboard/sessions/**/*).
- [x] Reestruturar o painel de planos do cliente no tema `.neo`, com métricas reais, gráfico temporal, insights automáticos e fallback sincronizado com o Supabase (src/app/(app)/dashboard/plans/**/*, src/app/api/client/plans/dashboard/route.ts).
- [x] Reimaginar o painel principal do cliente no tema `.neo`, com métricas hero, gráfico temporal, destaques, sessões, carteira, notificações e recomendações alimentadas por dados reais via `/api/client/dashboard/route.ts`, utilitários `src/lib/client/dashboard/*` e fallback determinístico em `src/lib/fallback/client-dashboard.ts`.
- [x] Migrar o painel de planos do PT para o tema `.neo`, com métricas agregadas, timeline semanal e destaques operacionais ligados à nova rota `/api/pt/plans/dashboard` e utilitários `src/lib/trainer/plans/*`.
- [x] Migrar a agenda de treinos do PT para o tema `.neo`, com métricas hero, distribuição de presenças, destaques operacionais e tabela filtrável servidos pela rota `/api/pt/workouts/dashboard` e utilitários `src/lib/trainer/workouts/*`.
- [x] Migrar a biblioteca de exercícios do PT para o tema `.neo`, com métricas hero, gráfico temporal, distribuições e tabela filtrável alimentadas pela rota `/api/pt/library/dashboard`, utilitários `src/lib/trainer/library/*` e fallback determinístico em `src/lib/fallback/trainer-library.ts`.
- [x] Reimaginar o painel principal do treinador no tema `.neo`, com métricas hero, gráfico temporal, agenda semanal, destaques operacionais e pedidos alimentados pela nova rota `/api/trainer/dashboard/route.ts`, utilitários `src/lib/trainer/dashboard/*` e fallback determinístico em `src/lib/fallback/trainer-dashboard.ts`.
- [x] Reconstruir o painel de mensagens (`src/app/(app)/dashboard/messages/**/*`, `/api/messages/dashboard`) com cartões hero, gráfico temporal, distribuição por canal, destaques automáticos e fallbacks determinísticos em `src/lib/fallback/messages.ts`.
- [x] Reimaginar o painel de métricas operacionais com dashboards `.neo`, API `/api/system/metrics`, utilitários `src/lib/system/*` e fallback determinístico em `src/lib/fallback/system.ts`.
- [x] Migrar o painel de logs do sistema para `.neo`, com métricas hero, linha temporal, distribuição e tabela alimentadas pela nova rota `/api/system/logs/dashboard`, utilitários `src/lib/system/logs/*` e fallback determinístico em `src/lib/fallback/system-logs.ts`.
- [x] Reimaginar o painel de definições com métricas `.neo`, gráfico temporal e formulários integrados ligados ao Supabase (src/app/(app)/dashboard/settings/**/*, src/app/api/settings/dashboard/route.ts, src/lib/settings/*, src/lib/fallback/settings.ts).
- [x] Migrar o painel de perfil para `.neo`, com métricas hero, timeline, destaques e formulários ligados ao Supabase (`src/app/(app)/dashboard/profile/**/*`, `/api/profile/dashboard`, `src/lib/profile/*`, `src/lib/fallback/profile.ts`).
- [x] Migrar a biblioteca de exercícios administrativa para o tema `.neo`, com métricas analíticas, distribuições e gestão ligada ao Supabase (`src/app/(app)/dashboard/admin/exercises/**/*`, `/api/admin/exercises/dashboard`, `src/lib/admin/exercises/*`, `src/lib/fallback/admin-exercises.ts`).
- [x] Migrar o painel administrativo de clientes para `.neo`, com métricas hero, gráfico temporal, distribuições e tabela filtrável alimentadas pelo Supabase (`src/app/(app)/dashboard/admin/clients/**/*`, `/api/admin/clients/dashboard`, `src/lib/admin/clients/*`, `src/lib/fallback/admin-clients.ts`).
- [ ] Refinar as sidebars de PT/cliente com badges dinâmicos e entradas contextuais (quick actions, indicadores de progresso).
- [ ] Definir padrão consistente para uso de rotas Next.js vs. cliente Supabase (tempo real) e aplicá-lo aos módulos de mensagens/notificações.
- [ ] Optimizar consultas com índices e vistas materializadas (existe esboço, mas falta adopção generalizada).
- [x] Polir UX/UI das páginas em construção (Relatórios, Definições e Biblioteca adoptaram o tema `.neo` com métricas reais e responsividade reforçada).
- [ ] Harmonizar o design dos dashboards (admin, PT e cliente) com a linguagem visual HMS, validando breakpoints mobile/desktop.
- [ ] Completar o fluxo operacional do PT (clientes, planos, agenda e biblioteca) com dados reais e interacções consistentes.
- [ ] Documentar configuração e variáveis de ambiente actualizadas após migração para Supabase.
- [ ] Remover dependências/artefactos não utilizados (ex.: pacotes Prisma, scripts legados) após consolidação da camada de dados.
- [ ] Adicionar protecções de rate limiting e validações adicionais nas rotas sensíveis.
- [ ] Introduzir testes automatizados (unitários/integrados) para ACL, logs e operações críticas.

## Fase 3 - Funcionalidades Futuras
- [x] Finalizar módulo de facturação/pagamentos (UI `.neo` ligada à tabela `billing_invoices`, API `/api/billing/dashboard` e fallbacks determinísticos prontos para integração com gateway).
- [ ] Implementar relatórios avançados (financeiros, progresso do cliente, desempenho de PTs) — visão inicial entregue com métricas reais e ranking de treinadores; expandir para previsões e benchmarking.
- [ ] Evoluir sistema de mensagens/notificações para suporte a envio em tempo real e threads.
- [ ] Completar gestão da biblioteca de exercícios com CRUD e selector avançado.
- [ ] Introduzir um planeador de sessões/agenda com sincronização externa (Google/Apple) e insights de disponibilidade.
- [ ] Avaliar experiências mobile (PWA/app) e integração com calendários externos.
- [ ] Planear integrações futuras (wearables, pagamentos adicionais, gamificação) conforme feedback de utilizadores.
