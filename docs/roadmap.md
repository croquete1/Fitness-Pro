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
- [x] Disponibilizar pesquisa global no header com resultados para utilizadores/sessões/aprovações e fallback offline. Fontes: `src/components/layout/AppHeader.tsx`, `src/app/(app)/dashboard/search/page.tsx`, `src/app/(app)/dashboard/search/search.client.tsx`, `src/lib/fallback/users.ts`.
- [x] Reestruturar os dashboards de admin e PT em componentes client-friendly para eliminar erros de serialização e garantir responsividade. Fontes: `src/app/(app)/dashboard/admin/AdminDashboardClient.tsx`, `src/components/dashboard/TrainerDashboardClient.tsx`, `src/components/dashboard/TrainerHome.tsx`.
- [x] Endurecer o endpoint de planos administrativos com guarda de administrador e fallbacks Supabase. Fonte: `src/app/api/admin/plans/route.ts`.
- [x] Modernizar a ficha detalhada de clientes/utentes com overview completo, métricas e gestão de PT em cartão único. Fontes: `src/app/(app)/dashboard/users/[id]/page.tsx`, `src/app/(app)/dashboard/users/[id]/profile.client.tsx`.

## Fase 2 - Melhorias Estruturais
- [ ] Validar carregamento real da lista de utilizadores/aprovações no Supabase (remoção dos fallbacks quando a API estiver estável e seeds completos).
- [ ] Harmonizar o toggle de tema (cookies + localStorage) para eliminar flashes e estados mistos no login.
- [ ] Refinar as sidebars de PT/cliente com badges dinâmicos e entradas contextuais (quick actions, indicadores de progresso).
- [ ] Definir padrão consistente para uso de rotas Next.js vs. cliente Supabase (tempo real) e aplicá-lo aos módulos de mensagens/notificações.
- [ ] Optimizar consultas com índices e vistas materializadas (existe esboço, mas falta adopção generalizada).
- [ ] Polir UX/UI das páginas em construção (Relatórios, Biblioteca, Definições) garantindo responsividade total.
- [ ] Harmonizar o design dos dashboards (admin, PT e cliente) com a linguagem visual HMS, validando breakpoints mobile/desktop.
- [ ] Completar o fluxo operacional do PT (clientes, planos, agenda e biblioteca) com dados reais e interacções consistentes.
- [ ] Documentar configuração e variáveis de ambiente actualizadas após migração para Supabase.
- [ ] Remover dependências/artefactos não utilizados (ex.: pacotes Prisma, scripts legados) após consolidação da camada de dados.
- [ ] Adicionar protecções de rate limiting e validações adicionais nas rotas sensíveis.
- [ ] Introduzir testes automatizados (unitários/integrados) para ACL, logs e operações críticas.

## Fase 3 - Funcionalidades Futuras
- [ ] Finalizar módulo de facturação/pagamentos (ligar UI a dados reais e/ou integração com gateway).
- [ ] Implementar relatórios avançados (financeiros, progresso do cliente, desempenho de PTs).
- [ ] Evoluir sistema de mensagens/notificações para suporte a envio em tempo real e threads.
- [ ] Completar gestão da biblioteca de exercícios com CRUD e selector avançado.
- [ ] Introduzir um planeador de sessões/agenda com sincronização externa (Google/Apple) e insights de disponibilidade.
- [ ] Avaliar experiências mobile (PWA/app) e integração com calendários externos.
- [ ] Planear integrações futuras (wearables, pagamentos adicionais, gamificação) conforme feedback de utilizadores.
