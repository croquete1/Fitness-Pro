HMS Dashboard (PT)

Dashboard moderna para gestão de clientes, treinos e administração (RBAC), construída com Next.js (App Router), TypeScript, Prisma e NextAuth. Otimizada para deploy em Vercel e preparada para tema claro/escuro.

🎯 Objetivo: fornecer uma base sólida, estável e extensível para a tua aplicação de personal training/gestão de ginásio.

✨ Principais Funcionalidades

Autenticação segura (NextAuth) com credenciais (e opcionalmente provedores OAuth).

RBAC (perfis: admin, trainer, client) e guardas de rota.

Módulos de Dashboard:

PT – Clientes (listagem, pesquisa, detalhes)

Administração (aprovações, gestão de utilizadores)

Sistema (logs, auditoria, definições)

Audit Log de ações críticas (criação/edição/aprovação).

Dark/Light mode (toggle persistente por utilizador).

API Routes no App Router (/app/api/**) com validação de dados.

Prisma ORM com migrações e seed inicial.

Pronto para CI/CD e previews no Vercel.

## 🔐 Configuração do Audit Log no Supabase

Para que a lista de utilizadores e os relatórios de histórico mostrem o último login,
atividade recente e estado online, cria a tabela `audit_log` no teu projeto Supabase.

1. Abre o SQL Editor no painel do Supabase.
2. Copia o conteúdo de [`scripts/supabase-audit-log.sql`](scripts/supabase-audit-log.sql) e
   executa-o.

O script cria a tabela com todos os campos esperados pelo dashboard, adiciona índices
para consultas rápidas e ativa as políticas necessárias para que o backoffice registe
logins, logouts e outras ações automaticamente.

Consulta também o guia [Políticas de segurança do Supabase](docs/supabase-security.md)
para aplicar todas as regras de Row Level Security utilizadas pela aplicação.

🏗️ Stack Técnica

Next.js 14+ (App Router)

TypeScript

Prisma + PostgreSQL (compatível com MySQL/SQLite)

NextAuth (Credentials + opcional OAuth)

UI: CSS Modules/SCSS com o tema Neo (utilidades pré-compiladas, sem dependência de Tailwind em runtime)

Hospedagem: Vercel

