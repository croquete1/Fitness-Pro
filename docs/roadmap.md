# Roadmap Verificado

Este documento rastreia o estado actual das tarefas priorizadas identificadas na auditoria técnica anterior. Cada item inclui a situação actual na base de código.

## Fase 1 – Correções Imediatas
- [x] Alinhar método HTTP e normalizar estados na aprovação/suspensão de utilizadores (`POST`/`PATCH` aceites e alias `DISABLED` mapeado). Fonte: `src/app/api/admin/users/[id]/status/route.ts`.
- [x] Proteger a exportação CSV de utilizadores com guarda de administrador. Fonte: `src/app/api/admin/users.csv/route.ts`.
- [x] Implementar listagem de utilizadores com filtros, paginação e normalização de campos (`rows`/`count`). Fonte: `src/app/api/admin/users/route.ts`.
- [x] Permitir edição e remoção directa de utilizadores por ID com validação de role/status. Fonte: `src/app/api/admin/users/[id]/route.ts`.
- [x] Uniformizar rotas e navegação da área de PT (prefixo único `/dashboard/pt` com legados a redirecionar).
- [x] Limpar código legado da transição Prisma→Supabase e definir fonte única de verdade para utilizadores (repositório `userRepo` centraliza contagens/leituras e endpoints deixaram de atualizar `profiles`).
- [x] Activar logging/auditoria em todas as acções críticas (criação/edição/estado/role/bulk aprovações agora registam eventos em `audit_logs`).
- [x] Melhorar feedback de UI e tratamento de erros silenciosos (login/registo agora validam com mensagens contextuais e toasts consistentes). Fontes: `src/app/login/page.tsx`, `src/app/register/RegisterClient.tsx`.
- [x] Realizar passagem de testes E2E cobrindo fluxo completo de registo→aprovação→dashboard (primeira suite Playwright validando o fluxo de autenticação/log-in). Fontes: `playwright.config.ts`, `tests/e2e/login.spec.ts`.
- [x] Restaurar a sidebar única com navegação PT completa, rótulos visíveis e toggle de tema funcional (eliminação de duplicados nos layouts e actualização do `ThemeToggleButton`). Fontes: `src/components/layout/DashboardFrame.tsx`, `src/components/layout/RoleSidebar.tsx`, `src/components/layout/SidebarPT.tsx`, `src/components/theme/ThemeToggleButton.tsx`.

## Fase 2 – Melhorias Estruturais
- [ ] Definir padrão consistente para uso de rotas Next.js vs. cliente Supabase (tempo real) e aplicá-lo aos módulos de mensagens/notificações.
- [ ] Optimizar consultas com índices e vistas materializadas (existe esboço, mas falta adopção generalizada).
- [ ] Polir UX/UI das páginas em construção (Relatórios, Biblioteca, Definições) garantindo responsividade total.
- [ ] Documentar configuração e variáveis de ambiente actualizadas após migração para Supabase.
- [ ] Remover dependências/artefactos não utilizados (ex.: pacotes Prisma, scripts legados) após consolidação da camada de dados.
- [ ] Adicionar protecções de rate limiting e validações adicionais nas rotas sensíveis.
- [ ] Introduzir testes automatizados (unitários/integrados) para ACL, logs e operações críticas.

## Fase 3 – Funcionalidades Futuras
- [ ] Finalizar módulo de faturação/pagamentos (ligar UI a dados reais e/ou integração com gateway).
- [ ] Implementar relatórios avançados (financeiros, progresso do cliente, desempenho de PTs).
- [ ] Evoluir sistema de mensagens/notificações para suporte a envio em tempo real e threads.
- [ ] Completar gestão da biblioteca de exercícios com CRUD e selector avançado.
- [ ] Avaliar experiências mobile (PWA/app) e integração com calendários externos.
- [ ] Planejar integrações futuras (wearables, pagamentos adicionais, gamificação) conforme feedback de utilizadores.

