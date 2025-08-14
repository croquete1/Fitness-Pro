Fitness-Pro Dashboard (PT)

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

🏗️ Stack Técnica

Next.js 14+ (App Router)

TypeScript

Prisma + PostgreSQL (compatível com MySQL/SQLite)

NextAuth (Credentials + opcional OAuth)

UI: CSS Modules/SCSS (com suporte opcional para Tailwind, se ativado)

Hospedagem: Vercel

Nota: O projeto funciona sem Tailwind. Se quiseres Tailwind + shadcn/ui, ativa conforme indicado abaixo.

✅ Requisitos

Node.js ≥ 18

Base de dados (PostgreSQL recomendado)

Conta Vercel (opcional, para deploy)
