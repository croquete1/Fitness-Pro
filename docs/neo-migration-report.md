# Relatório de adopção do tema Neo

## Visão geral

Executámos `npm run neo:audit` para mapear utilitários ainda baseados em Tailwind/MUI e marcadores de funcionalidades por concluir. O script percorre `src/` inteiro e sinaliza linhas com `className` contendo tokens utilitários, imports de `@mui/*` e TODOs/mocks que impedem a adopção completa do tema `.neo`. 【F:scripts/neo-theme-audit.mjs†L1-L196】

## Componentes que ainda usam Tailwind utilitário

- Diversos editores administrativos (`src/components/plan/PlanEditor.tsx`, `src/components/packages/PackageEditor.tsx`) preservam tokens `rounded-*`, `gap-*` e responsividade utilitária.

## Dependências ainda baseadas em MUI

- `src/components/profile/ProfileForm.tsx` importa múltiplos componentes de `@mui/material` (`Box`, `Paper`, `Stack`, `TextField`, etc.), mantendo a camada de design antiga. 【F:src/components/profile/ProfileForm.tsx†L1-L165】
- `src/components/profile/MetricsTable.tsx` e `src/components/profile/MetricsChart.tsx` continuam a usar `@mui/material` para tabelas e cartões. 【F:src/components/profile/MetricsTable.tsx†L1-L144】【F:src/components/profile/MetricsChart.tsx†L1-L120】
- `src/styles/dashboardContentSx.ts` define estilos `SxProps` específicos de MUI, o que liga o layout à API antiga. 【F:src/styles/dashboardContentSx.ts†L1-L120】

## Funcionalidades com dados mock ou TODOs

- As rotas críticas de perfil de cliente (`/api/users/[id]/notes|packages|anthropometry|sessions|plans`) foram ligadas ao Supabase com validação de permissões, eliminando o `_memdb` em memória. 【F:src/app/api/users/[id]/notes/route.ts†L1-L112】【F:src/app/api/users/[id]/packages/route.ts†L1-L87】【F:src/app/api/users/[id]/anthropometry/route.ts†L1-L146】【F:src/app/api/users/[id]/sessions/route.ts†L1-L141】【F:src/app/api/users/[id]/plans/route.ts†L1-L55】
- Continuam por migrar módulos administrativos que usam dados simulados ou caches locais, especialmente em onboarding e histórico de planos.

## Gargalos de performance percebida

- `TrainerScheduleClient` acumula 200+ linhas de lógica cliente, fetch manual e renderização de listas sem memoização/virtualização, contribuindo para a sensação de UI "pesada". 【F:src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx†L1-L284】
- O exportador CSV/print gera HTML inline e abre `window.open`, bloqueando o thread principal durante filtros longos. 【F:src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx†L229-L360】

## Actualizações e vulnerabilidades pendentes

- `npm outdated` aponta versões atrás em `next@15.5.4`, `react@18.3.1` (já existe 19.x), `jspdf`/`jspdf-autotable` e todo o stack `@mui`, reforçando a dívida técnica da camada antiga. 【c9f047†L1-L22】
- `npm audit` reporta 3 vulnerabilidades (1 moderada, 2 altas) devido ao `dompurify` legado trazido por `jspdf` e `jspdf-autotable`. Actualizar estes pacotes para ≥3.0.3/5.0.2 elimina o risco. 【b8ffa6†L1-L15】

## Progresso recente

- O painel de mensagens do cliente (`src/app/(app)/dashboard/messages/**/*`) passou a usar exclusivamente estruturas `.neo` (`neo-stack`, `neo-inline`, `neo-code`), eliminando espaçamentos utilitários e tokens Tailwind antigos.
- O fluxo de onboarding administrativo (`src/app/(app)/dashboard/admin/onboarding/AdminOnboardingListClient.tsx`) abandonou MUI/DataGrid em favor do design system `.neo`, com métricas reais do Supabase, filtros declarativos e tabela acessível sem utilitários legados.
- O atalho móvel (`src/components/common/MobileFAB.tsx`) ganhou estilos dedicados `.neo-fab`, com menu translúcido e botão temático responsivo.
- O cabeçalho do treinador (`src/components/trainer/TrainerHeader.tsx`) foi reconstruído com o padrão `neo-app-header`, substituindo gradients Tailwind por tokens do tema e avatar com contorno Neo.
- A agenda de PT (`src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx`) recebeu uma revisão estrutural: filtros, métricas e tabela agora usam novos utilitários `.neo`, botões declarativos (`data-variant`) e feedbacks (`neo-spinner`, `neo-table-empty`).
- O painel de relatórios operacionais (`src/app/(app)/dashboard/reports/ReportsDashboardClient.tsx`) foi novamente reconstruído sobre estruturas `.neo`, agora com filtros colados, cartões de métricas temáticos, exportação CSV declarativa e secções de receita/sessões/avaliações alimentadas por dados reais do Supabase sem utilitários Tailwind.
- O histórico de sessões (`src/app/(app)/dashboard/history/SessionHistoryClient.tsx` + `page.tsx`) foi reimaginado no tema `.neo`, com filtros avançados, métricas em tempo real do Supabase, exportação CSV e listagens enriquecidas com nomes de clientes e PTs.
- O centro de operações administrativo (`src/app/(app)/dashboard/admin/AdminDashboardClient.tsx`) passou a usar apenas padrões `.neo`, com métricas, agenda e listagens reconstruídas sem utilitários Tailwind e botões alinhados aos `data-variant` do tema.
- Os cartões auxiliares do painel admin (`src/components/admin/MotivationAdminCard.tsx`, `src/components/admin/AdminQuickNotesCard.tsx`) foram actualizados para layouts `.neo`, abandonando `flex` utilitário e classes de espaçamento.
- A rota `/api/stats` liga-se agora ao Supabase para gerar contagens reais (utilizadores recentes, pacotes activos, sessões futuras e notas) e devolve tons temáticos em vez de classes Tailwind. 【F:src/app/api/stats/route.ts†L1-L75】
- O perfil detalhado do cliente (`src/app/(app)/dashboard/users/[id]/profile.client.tsx`) foi reescrito sem MUI, adoptando cards, métricas e formulários `.neo` com estados acessíveis e botões partilhados.
- Implementámos tabelas reais no Supabase para pacotes e notas de clientes (`supabase/migrations/20250328_add_client_notes_and_packages.sql`), permitindo que o front-end consuma dados vivos e remova mocks legados.
- A escala administrativa de treinadores (`src/app/(app)/dashboard/admin/roster/RosterClient.tsx`) adoptou os padrões `.neo`, ligando-se às novas tabelas `trainer_roster_assignments`/`trainer_roster_events` no Supabase e expondo filtros, métricas e cronologia com dados reais.
- A gestão de aprovações (`src/app/(app)/dashboard/admin/approvals/ApprovalsClient.tsx`) agora utiliza apenas estruturas `.neo`, com métricas temáticas, filtros declarativos e tabela padronizada; o backend continua a integrar com Supabase e fornece fallback informativo quando não configurado.
- O centro de notificações do utilizador (`src/app/(app)/dashboard/notifications/NotificationsClient.tsx`) foi reimaginado no tema `.neo`, com métricas reais do Supabase, distribuição temporal, filtros por tipo e fallback demonstrativo quando o backend está offline.
- O módulo de métricas do cliente (`src/app/(app)/dashboard/clients/metrics/**/*`) foi reconstruído no tema `.neo`, com cartões dinâmicos, gráfico interactivo, filtros de período e sincronização em tempo real com o Supabase (incluindo fallback documentado e dataset de referência).
- O painel de sessões do cliente (`src/app/(app)/dashboard/sessions/SessionsClient.tsx`) foi redesenhado com cartões `.neo`, timeline de presença, ranking de PT e gestão de pedidos alimentados por dados reais do Supabase (com fallback dinâmico quando a API não responde).
- O painel de planos do cliente (`src/app/(app)/dashboard/plans/PlansClient.tsx` + `/page.tsx`) foi convertido para a experiência `.neo`, combinando métricas reais do Supabase, insights automáticos, gráfico de atualizações e tabela filtrável com fallback documentado.
- O módulo de faturação do cliente (`src/app/(app)/dashboard/billing/BillingClient.tsx` + `/page.tsx`) foi migrado para o tema `.neo`, com cartões hero, timeline analítica, destaques operacionais e tabela filtrável alimentados pela nova API `/api/billing/dashboard` com dados reais do Supabase e fallback determinístico.
- Criámos a migração `supabase/migrations/20250416_add_billing_invoices.sql`, introduzindo a tabela `billing_invoices`, índices e seeds para suportar as métricas de faturação sem depender de mocks.
- A administração de utilizadores (`src/app/(app)/dashboard/users/UsersClient.tsx`) foi migrada para o tema `.neo`, oferecendo métricas agregadas reais do Supabase, gráfico temporal, destaques accionáveis e fallback automático através da nova rota `/api/admin/users/dashboard` e utilitários `src/lib/users/*`.
- Acrescentámos o script `supabase/migrations/20250404_add_trainer_roster.sql` para suportar a escala de PTs, vistas `admin_trainer_roster(*)` e políticas de serviço, removendo dependências de mocks nesse fluxo.
- A infraestrutura de notificações ganhou a migração `supabase/migrations/20250408_add_notifications.sql`, que define tabela, índices, triggers e políticas RLS para dados reais; os tipos foram sincronizados em `src/types/supabase.ts`.
- O centro de controlo e a página de métricas (`src/app/(app)/dashboard/system/page.tsx` e `src/app/(app)/dashboard/system/metrics/page.tsx`) foram migrados para os padrões `.neo`, com grelhas declarativas, estados vazios acessíveis e sem utilitários Tailwind, lendo directamente das novas tabelas de observabilidade.
- Criámos a migração `supabase/migrations/20250410_add_system_observability.sql`, que introduz `system_services`, `system_maintenance_windows` e `system_insights` com seeds, índices, triggers e políticas RLS; os tipos foram sincronizados em `src/types/supabase.ts`.
- A página de saúde operacional (`src/app/(app)/dashboard/system/health/page.tsx`) foi reescrita com `neo-stack`, `neo-grid` e `status-pill`, consumindo directamente `system_services`, `system_monitors` e `system_resilience_practices` no Supabase para eliminar dados mock. 【F:src/app/(app)/dashboard/system/health/page.tsx†L1-L247】
- Introduzimos a migração `supabase/migrations/20250412_add_system_health_and_dashboard_chart.sql`, que adiciona `system_monitors`, `system_resilience_practices`, amplia `system_services` com `trend_label` e cria `dashboard_chart_points` com seeds e políticas. 【F:supabase/migrations/20250412_add_system_health_and_dashboard_chart.sql†L1-L136】
- A rota `/api/dashboard/cart` agora consulta `dashboard_chart_points` para devolver séries reais, mantendo fallback quando o Supabase não está disponível. 【F:src/app/api/dashboard/cart/route.ts†L1-L43】

## Próximos passos recomendados

1. Priorizar a migração dos componentes administrativos restantes para padrões `.neo-*`, substituindo utilitários Tailwind por tokens declarativos.
2. Reescrever os módulos de perfil actualmente em MUI para componentes `.neo-form`, `.neo-card` e hooks partilhados.
3. Ligar as rotas com TODOs ao Supabase (quando necessário, fornecerei scripts SQL completos antes de aplicar mudanças) e remover `_memdb`.
4. Evoluir a agenda do PT para listas virtuais quando o volume de dados exceder 200 linhas, aproveitando a base `.neo` já aplicada.
5. Planear sprint específico para actualizar `jspdf`/`jspdf-autotable` (remediação das vulnerabilidades) e alinhar Next/React à versão suportada pelo tema.
