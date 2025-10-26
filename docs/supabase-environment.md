# Supabase Environment Configuration

Este guia consolida todas as variáveis de ambiente e opções de configuração necessárias para executar a aplicação após a migração completa para o Supabase. Utiliza-o como referência ao preparar `.env.local`, pipelines CI/CD ou secrets partilhados entre ambientes.

## Conjunto mínimo de variáveis

Cria um ficheiro `.env.local` com o seguinte esqueleto e preenche os valores indicados pelo projecto Supabase:

```bash
# URLs base
NEXT_PUBLIC_BASE_URL="http://localhost:3000"     # URL pública do frontend
NEXT_PUBLIC_APP_URL="http://localhost:3000"      # Mantido para compatibilidade de scripts legacy
NEXT_PUBLIC_SITE_URL="http://localhost:3000"     # Utilizado por rotas de email/reset
NEXTAUTH_URL="http://localhost:3000"             # Callback OAuth NextAuth

# Supabase (cliente)
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"

# Supabase (servidor)
SUPABASE_URL="https://<project>.supabase.co"      # Opcional, fallback para o URL público
SUPABASE_ANON_KEY="<anon-key>"                   # Opcional, fallback para o anon key público
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Autenticação
NEXTAUTH_SECRET="<64-char-random-string>"

# Web Push
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY="<vapid-public>"
WEB_PUSH_PUBLIC_KEY="<vapid-public>"
WEB_PUSH_PRIVATE_KEY="<vapid-private>"
WEB_PUSH_CONTACT_EMAIL="mailto:suporte@example.com"

# Miscelânea
DEFAULT_TZ="Europe/Lisbon"
```

> 💡 Em ambientes de produção, define também `APP_ORIGIN` quando a origem pública do Supabase divergir do domínio do frontend e `SITE_URL` quando for necessário enviar emails com ligações absolutas diferentes da `NEXT_PUBLIC_SITE_URL`.

## Referência completa

| Variável | Obrigatória | Contexto | Observações |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Fetch no cliente (ex.: `LiveCounters`) | Quando alojado na Vercel, usar `https://<project>.vercel.app`. |
| `NEXT_PUBLIC_APP_URL` | ⚠️ (legacy) | Scripts antigos de migração | Mantido para compatibilidade; recomenda-se alinhar com `NEXT_PUBLIC_BASE_URL`. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Emails/reset de palavra-passe | Utilizada para construir `redirectTo` em `/api/admin/reset-password`. |
| `NEXTAUTH_URL` | ✅ (prod) | NextAuth | Necessária para callbacks OAuth em produção. |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Clientes Next.js/Supabase | URL canónico do projecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clientes Next.js/Supabase | Chave anon pública; também serve de fallback no servidor. |
| `SUPABASE_URL` | ⚠️ | Camada server-side | Usada quando o ambiente não expõe `NEXT_PUBLIC_SUPABASE_URL`. |
| `SUPABASE_ANON_KEY` | ⚠️ | Camada server-side | Fallback para `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server) | Rotas API/CLI | Necessária para scripts `create-admin`, `promote-admin`, `reset-password`, e para `supabaseService`. |
| `SUPABASE_SERVICE_ROLE` / `SUPABASE_SERVICE_KEY` / `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` | ❌ | Legado | Mantidas apenas como fallback; preferir `SUPABASE_SERVICE_ROLE_KEY`. |
| `NEXTAUTH_SECRET` | ✅ | NextAuth JWT/CSRF | Obrigatório para sessão segura; partilha-se com `middleware.ts`. |
| `APP_ORIGIN` | ⚠️ | Emails públicos | Usado quando `NEXT_PUBLIC_APP_ORIGIN` não está definido. |
| `NEXT_PUBLIC_APP_ORIGIN` | ⚠️ | Emails públicos | Preferido para construir ligações absolutas em `/api/auth/forgot`. |
| `SITE_URL` | ⚠️ | Emails administrativos | Fallback para `NEXT_PUBLIC_SITE_URL` nas rotas de administração. |
| `NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS` | ❌ | Observabilidade | Define se o componente `OptionalSpeedInsights` inclui o snippet da Vercel (`'true'`). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ (push) | `push.ts` | Necessário para subscrever notificações Web Push. |
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | ✅ (push) | `PushActivator` | Deve coincidir com `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. |
| `WEB_PUSH_PUBLIC_KEY` | ✅ (push) | `lib/webpush.ts` | VAPID público do backend. |
| `WEB_PUSH_PRIVATE_KEY` | ✅ (push) | `lib/webpush.ts` | VAPID privado do backend. |
| `WEB_PUSH_CONTACT_EMAIL` | ✅ (push) | `lib/webpush.ts` | Email `mailto:` utilizado no cabeçalho `contact`. |
| `DEFAULT_TZ` | ⚠️ | Helpers de data | Fallback global para `Europe/Lisbon`. |
| `PORT` | ❌ | Playwright/dev server | Apenas relevante ao correr `playwright test`. |
| `CI` | ❌ | Playwright/Next | Varia scripts (reporter, reusar servidor). |
| `VERCEL_URL` | ❌ | Helpers de URL | Fallback automático para o domínio Vercel. |
| `NODE_ENV` | — | Node.js | Controla comportamento padrão do Next.js. |

## Boas práticas

1. **Segregar secrets**: armazena `SUPABASE_SERVICE_ROLE_KEY` e chaves VAPID nos secret managers da plataforma (Vercel, GitHub Actions, etc.).
2. **Sincroniza ambientes**: sempre que um novo ambiente é criado, replica o conjunto mínimo acima antes de efectuar deploys.
3. **Scripts Supabase**: quaisquer alterações ao esquema ou segurança devem passar pelos scripts existentes em `scripts/` (e incluir instruções completas no PR).
4. **Auditoria periódica**: utiliza `npm run neo:audit` e `npm run find:supabase-browser` para validar que novos módulos seguem o padrão actual.

Mantém este documento actualizado sempre que surgirem novas dependências de ambiente ou quando deixarem de ser necessárias.
