# Roadmap Verificado

Este documento rastreia o estado actual das tarefas priorizadas identificadas na auditoria técnica anterior. Cada item inclui a situação actual na base de código.

## Fase 1 – Correções Imediatas
- [x] Alinhar método HTTP e normalizar estados na aprovação/suspensão de utilizadores (`POST`/`PATCH` aceites e alias `DISABLED` mapeado). Fonte: `src/app/api/admin/users/[id]/status/route.ts`.
- [x] Proteger a exportação CSV de utilizadores com guarda de administrador. Fonte: `src/app/api/admin/users.csv/route.ts`.
- [x] Implementar listagem de utilizadores com filtros, paginação e normalização de campos (`rows`/`count`). Fonte: `src/app/api/admin/users/route.ts`.
- [x] Permitir edição e remoção directa de utilizadores por ID com validação de role/status. Fonte: `src/app/api/admin/users/[id]/route.ts`.
- [x] Uniformizar rotas e navegação da área de PT (prefixo único `/dashboard/pt` com legados a redirecionar).
- [ ] Limpar código legado da transição Prisma→Supabase e definir fonte única de verdade para utilizadores.
- [ ] Activar logging/auditoria em todas as acções críticas (logs ainda não são escritos nas operações recentes).
- [ ] Melhorar feedback de UI e tratamento de erros silenciosos (tostas e mensagens pendentes de revisão).
- [ ] Realizar passagem de testes E2E cobrindo fluxo completo de registo→aprovação→dashboard.

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

