# Relatório de adopção do tema Neo

## Visão geral

Executámos `npm run neo:audit` para mapear utilitários ainda baseados em Tailwind/MUI e marcadores de funcionalidades por concluir. O script percorre `src/` inteiro e sinaliza linhas com `className` contendo tokens utilitários, imports de `@mui/*` e TODOs/mocks que impedem a adopção completa do tema `.neo`. 【F:scripts/neo-theme-audit.mjs†L1-L196】

## Componentes que ainda usam Tailwind utilitário

- `src/components/common/MobileFAB.tsx` mantém tokens Tailwind (`md:hidden`, `rounded-full`, `bg-black`, `dark:`) tanto no botão flutuante como no menu contextual. 【F:src/components/common/MobileFAB.tsx†L7-L27】
- `src/components/trainer/TrainerHeader.tsx` aplica layout com utilitários (`sticky`, `max-w-screen-2xl`, `gap-4`, `dark:`), sem equivalentes `.neo`. 【F:src/components/trainer/TrainerHeader.tsx†L32-L54】
- O feed de mensagens continua a formatar linhas com `flex`, `space-y-3`, `text-sm`, `bg-[color:...]`, misturando padrões Tailwind com superfícies Neo. 【F:src/app/(app)/dashboard/messages/_components/MessagesFeed.tsx†L69-L108】
- A página de mensagens usa `flex flex-wrap` e `space-y-6` para o layout principal, faltando substituição pelos utilitários `.neo` (`neo-stack`, `neo-grid`, etc.). 【F:src/app/(app)/dashboard/messages/page.tsx†L22-L42】
- A agenda do PT (`TrainerScheduleClient`) mistura botões `.neo` com classes Tailwind (`btn icon`, `h-5 w-5`, `grid-cols`, `gap-4`) e ainda gere ícones inline sem tokens partilhados. 【F:src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx†L205-L284】

## Dependências ainda baseadas em MUI

- `src/components/profile/ProfileForm.tsx` importa múltiplos componentes de `@mui/material` (`Box`, `Paper`, `Stack`, `TextField`, etc.), mantendo a camada de design antiga. 【F:src/components/profile/ProfileForm.tsx†L1-L165】
- `src/components/profile/MetricsTable.tsx` e `src/components/profile/MetricsChart.tsx` continuam a usar `@mui/material` para tabelas e cartões. 【F:src/components/profile/MetricsTable.tsx†L1-L144】【F:src/components/profile/MetricsChart.tsx†L1-L120】
- `src/styles/dashboardContentSx.ts` define estilos `SxProps` específicos de MUI, o que liga o layout à API antiga. 【F:src/styles/dashboardContentSx.ts†L1-L120】

## Funcionalidades com dados mock ou TODOs

- O módulo `_memdb` ainda substitui integrações reais com Supabase para antropometria, planos, notas e sessões, mantendo dados em memória. 【F:src/app/api/_memdb.ts†L1-L84】
- Endpoints como `src/app/api/dashboard/stats/route.ts` permanecem com `// TODO: busca real no DB` e devolvem cartões com classes Tailwind. 【F:src/app/api/stats/route.ts†L1-L12】
- Rotas de sessões e notas do utilizador (`src/app/api/users/[id]/sessions/route.ts`, `src/app/api/users/[id]/notes/route.ts`) ainda têm TODOs para ligar a agenda real e associar autor autenticado. 【F:src/app/api/users/[id]/sessions/route.ts†L1-L120】【F:src/app/api/users/[id]/notes/route.ts†L1-L96】

## Gargalos de performance percebida

- `TrainerScheduleClient` acumula 200+ linhas de lógica cliente, fetch manual e renderização de listas sem memoização/virtualização, contribuindo para a sensação de UI "pesada". 【F:src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx†L1-L284】
- O exportador CSV/print gera HTML inline e abre `window.open`, bloqueando o thread principal durante filtros longos. 【F:src/app/(app)/dashboard/pt/schedule/TrainerScheduleClient.tsx†L229-L360】

## Actualizações e vulnerabilidades pendentes

- `npm outdated` aponta versões atrás em `next@15.5.4`, `react@18.3.1` (já existe 19.x), `jspdf`/`jspdf-autotable` e todo o stack `@mui`, reforçando a dívida técnica da camada antiga. 【c9f047†L1-L22】
- `npm audit` reporta 3 vulnerabilidades (1 moderada, 2 altas) devido ao `dompurify` legado trazido por `jspdf` e `jspdf-autotable`. Actualizar estes pacotes para ≥3.0.3/5.0.2 elimina o risco. 【b8ffa6†L1-L15】

## Próximos passos recomendados

1. Priorizar a migração dos componentes listados para padrões `.neo-*`, substituindo gradualmente utilitários Tailwind por tokens declarativos.
2. Reescrever os módulos de perfil actualmente em MUI para componentes `.neo-form`, `.neo-card` e hooks partilhados.
3. Ligar as rotas com TODOs ao Supabase (quando necessário, fornecerei scripts SQL completos antes de aplicar mudanças) e remover `_memdb`.
4. Fragmentar a agenda do PT em subcomponentes com memoização, adoptando listas virtuais ou grids `.neo` para reduzir custo de render.
5. Planear sprint específico para actualizar `jspdf`/`jspdf-autotable` (remediação das vulnerabilidades) e alinhar Next/React à versão suportada pelo tema.
