# Supabase Security Hardening Script

Este projeto inclui o ficheiro [`scripts/supabase-security-hardening.sql`](../scripts/supabase-security-hardening.sql) com todas as políticas de Row Level Security, funções auxiliares e ajustes necessários para alinhar a base de dados com o código da aplicação.

## Como aplicar

1. Acede ao [Supabase SQL Editor](https://app.supabase.com/).
2. Seleciona o projeto correspondente ao ambiente onde queres aplicar as alterações.
3. Copia o conteúdo completo do script e cola-o no editor.
4. Executa o script de uma só vez. O bloco `DO $$ ... $$;` assegura que todas as políticas são criadas através do helper `ensure_policy` sem produzir linhas vazias no resultado.

> ⚠️ Recomenda-se validar primeiro em ambiente de testes antes de aplicar em produção.

## Estrutura do script

- **Funções auxiliares**: `is_admin`, `is_trainer`, `is_client` e `ensure_policy`.
- **View** `onboarding_forms_with_user`: facilita o acesso a dados combinados de formulários e utilizadores.
- **Ativação de RLS**: garante que todas as tabelas sensíveis usam Row Level Security.
- **Políticas**: agrupadas por domínio (onboarding, perfis, planos, etc.) para uma leitura mais simples.

Qualquer alteração na segurança do Supabase deve ser efetuada através deste ficheiro para manter a consistência entre ambientes.
