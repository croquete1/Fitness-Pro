[06:16:14.900] Running build in Washington, D.C., USA (East) – iad1
[06:16:14.900] Build machine configuration: 2 cores, 8 GB
[06:16:14.915] Cloning github.com/croquete1/Fitness-Pro (Branch: main, Commit: e97c495)
[06:16:15.391] Cloning completed: 476.000ms
[06:16:19.140] Restored build cache from previous deployment (3F3ihB6fhN1CRsDG764gJPUtAujN)
[06:16:24.618] Running "vercel build"
[06:16:25.056] Vercel CLI 45.0.10
[06:16:25.517] Installing dependencies...
[06:16:28.615] 
[06:16:28.615] > fitness-pro@0.1.0 postinstall
[06:16:28.615] > node scripts/check-duplicate-routes.cjs && prisma generate
[06:16:28.616] 
[06:16:28.737] ✅ Nenhuma rota duplicada encontrada.
[06:16:31.331] Prisma schema loaded from prisma/schema.prisma
[06:16:31.645] 
[06:16:31.645] ✔ Generated Prisma Client (v6.14.0) to ./node_modules/@prisma/client in 160ms
[06:16:31.645] 
[06:16:31.647] Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
[06:16:31.647] 
[06:16:31.647] Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
[06:16:31.647] 
[06:16:31.669] 
[06:16:31.669] changed 16 packages in 6s
[06:16:31.670] 
[06:16:31.670] 176 packages are looking for funding
[06:16:31.671]   run `npm fund` for details
[06:16:31.705] Detected Next.js version: 14.2.5
[06:16:31.710] Running "npm run build"
[06:16:31.821] 
[06:16:31.821] > fitness-pro@0.1.0 prebuild
[06:16:31.821] > node scripts/check-duplicate-routes.cjs && node scripts/verify-manifest.cjs && node scripts/verify-sidebar.cjs && node scripts/find-invalid-catchall.cjs && node scripts/verify-prisma-enum.cjs
[06:16:31.822] 
[06:16:31.859] ✅ Nenhuma rota duplicada encontrada.
[06:16:31.889] 
[06:16:31.890] 🔎 Verificação de ficheiros segundo project.manifest.json
[06:16:31.890] 
[06:16:31.891] 1) Obrigatórios:
[06:16:31.891]    ✅ package.json
[06:16:31.891]    ✅ scripts/check-duplicate-routes.cjs
[06:16:31.891]    ✅ src/lib/prisma.ts
[06:16:31.891]    ✅ src/lib/auth.ts
[06:16:31.892]    ✅ src/types/next-auth.d.ts
[06:16:31.892]    ✅ src/middleware.ts
[06:16:31.892]    ✅ src/app/api/auth/[...nextauth]/route.ts
[06:16:31.892]    ✅ src/app/api/register/route.ts
[06:16:31.892]    ✅ src/app/api/dashboard/stats/route.ts
[06:16:31.892]    ✅ src/app/login/page.tsx
[06:16:31.893]    ✅ src/app/login/LoginClient.tsx
[06:16:31.893]    ✅ src/app/(app)/dashboard/page.tsx
[06:16:31.893]    ✅ src/components/dashboard/Tabs.tsx
[06:16:31.893]    ✅ src/components/dashboard/AdminCountCard.tsx
[06:16:31.893]    ✅ prisma/schema.prisma
[06:16:31.894] 
[06:16:31.894] 2) Opcionais (informativo):
[06:16:31.894]    ☑︎ existe: src/app/api/admin/reset-password/route.ts
[06:16:31.894]    ☐ em falta (opcional): src/app/api/admin/roles/normalize/route.ts
[06:16:31.894]    ☑︎ existe: src/app/register/page.tsx
[06:16:31.894] 
[06:16:31.895] 3) Duplicados proibidos:
[06:16:31.895]    ✅ OK: src/app/(app)/dashboard/page.tsx <-> src/app/dashboard/page.tsx
[06:16:31.895] 
[06:16:31.895] 4) NextAuth route:
[06:16:31.895]    ✅ Encontrado: src/app/api/auth/[...nextauth]/route.ts
[06:16:31.895] 
[06:16:31.895] ✅ Verificação concluída sem erros.
[06:16:31.895] 
[06:16:31.929] ✅ Sidebar verificada (todas as páginas necessárias existem).
[06:16:31.963] ✅ Sem catch-all inválidos.
[06:16:31.994] ✅ enum Status OK (PENDING, ACTIVE, SUSPENDED)
[06:16:31.998] 
[06:16:32.003] > fitness-pro@0.1.0 build
[06:16:32.003] > next build
[06:16:32.004] 
[06:16:32.731]   ▲ Next.js 14.2.5
[06:16:32.732] 
[06:16:32.808]    Creating an optimized production build ...
[06:16:37.756]  ⚠ Compiled with warnings
[06:16:37.757] 
[06:16:37.757] ./src/app/api/events/route.ts
[06:16:37.757] Attempted import error: 'fetchEventsSince' is not exported from '@/lib/events' (imported as 'fetchEventsSince').
[06:16:37.757] 
[06:16:37.757] Import trace for requested module:
[06:16:37.757] ./src/app/api/events/route.ts
[06:16:37.757] 
[06:16:42.452]  ✓ Compiled successfully
[06:16:42.453]    Linting and checking validity of types ...
[06:16:51.961] 
[06:16:51.962] Failed to compile.
[06:16:51.962] 
[06:16:51.962] ./src/app/api/admin/users/UsersClient.tsx
[06:16:51.963] 97:63  Warning: React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[06:16:51.963] 
[06:16:51.963] ./src/components/Sidebar.tsx
[06:16:51.963] 59:41  Error: 'onClose' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[06:16:51.964] 112:6  Warning: React Hook useMemo has missing dependencies: 'grpAdmin', 'grpPT', and 'grpSystem'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[06:16:51.964] 
[06:16:51.964] ./src/components/SidebarWrapper.tsx
[06:16:51.965] 13:9  Error: 'closeHover' is assigned a value but never used. Allowed unused vars must match /^_/u.  @typescript-eslint/no-unused-vars
[06:16:51.966] 
[06:16:51.966] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[06:16:52.018] Error: Command "npm run build" exited with 1