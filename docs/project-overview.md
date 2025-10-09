# Fitness Pro Platform Overview

This document summarizes the current understanding of the Fitness Pro dashboard platform
based on the provided roadmap, existing source structure, and conventions already adopted
in the repository. It is meant to ensure alignment before tackling the outstanding tasks in
the backlog.

## High-level architecture

- **Framework**: Next.js (App Router) with server components for layouts and data
  fetching, client components for interactive dashboards, and edge-ready SSR handlers.
- **UI System**: Pure Material UI (MUI) components styled via the theme setup under
  `src/theme`, with support for light/dark toggling and emojis to keep the experience
  friendly for admins, trainers, and clients.
- **Data Layer**: Supabase accessed through the shared `serverSB()` helper, with SWR
  hooks and custom React hooks to refresh data client-side without breaking RLS.
- **Layout Skeleton**: `DashboardFrame` renders the persistent AppHeader and role-based
  sidebars, while page-level content slots in as children for each area of the app.

## Role-aware header counts

- Counts are pre-fetched server-side in each layout and injected into
  `HeaderCountsProvider` so that the header badges hydrate instantly for Admin, Client,
  and Trainer roles.
- Admin counts cover approvals and notifications, client counts cover messages and
  notifications, and trainer counts expose schedule metrics such as today/next 7 days.
- Custom hooks (`useHeaderCounts`, `useTrainerPtsCounts`) read these values on the client
  to keep the header and sidebar indicators synchronized.

## Feature modules tracked in the roadmap

1. **Infra & Layout**: Stable foundation with `DashboardFrame`, `AppHeader`, and
   `RoleSidebar`. Outstanding work is ensuring each layout passes the correct
   `initialCounts` snapshot to the header provider.
2. **PTS Schedule**: Full CRUD for personal training sessions including duplication,
   conflict validation, and SSR/SWR-backed listings for Admin and Trainer views.
   Printing/CSV export hooks are staged but need to be wired up.
3. **Exercises & Users**: Table management with "Create from…" dialogs for fast
   duplication. Potential enhancements include unified forms and export/print parity with
   the schedule module.
4. **Supabase Utilities**: Normalized helpers (`getSBC`, `serverSB`) must stay consistent
   across API routes to respect cookies and RLS policies.
5. **Database & RLS**: Sessions table enforces role-based access (admin unrestricted,
   trainers limited to their sessions, clients optional). Seed data ensures a working dev
   baseline with one user per role.

## Workflow expectations

- Server utilities, layouts, and API routes should always depend on the `serverSB()`
  alias to avoid inconsistencies.
- Each change set should be committed locally before opening a pull request, allowing a
  clean history and easier reviews.
- Tests such as `npm run typecheck` and linting should pass; any environment blockers must
  be documented in the PR notes.

This overview should make it clear how the platform is structured and which pending tasks
need attention so we can confidently move to the next roadmap milestones without
introducing regressions.
