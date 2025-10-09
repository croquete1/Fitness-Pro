# Fitness Pro Platform Overview

## Tech Stack
- **Framework**: Next.js App Router with server-side rendering and layout slots.
- **UI**: Material UI (MUI) components without custom wrapper libraries.
- **Data**: Supabase used on the server via helper utilities, with SWR/hooks for client refreshes.

## Layout & Navigation
- `DashboardFrame` provides the shared header + sidebar shell that every role-specific layout renders inside.
- `AppHeader` exposes badge slots for approvals/messages/notifications and handles theme toggling and account actions.
- `RoleSidebar` switches between the Admin, Trainer, and Client sidebars while hydrating role-aware counters.

## Header Counters
- `HeaderCountsProvider` stores snapshot counts so the header stays in sync with server-fetched data.
- Admin dashboards hydrate `approvalsCount` and `notificationsCount`.
- Client dashboards hydrate `messagesCount` and `notificationsCount`.
- Trainer dashboards can hydrate `today` and `next7` PTS session counts when the header needs them.

## Workflow Notes
- Always commit local changes before triggering automated workflows or PR tooling.
- API routes under `src/app/api/**` are treated as critical by CI. Avoid touching them unless the change has explicit approval or the `allow-auth-changes` label is added upstream.

## Next Steps
- Re-enable CSV/print utilities in PTS/Exercises/User tables.
- Confirm Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are populated for SSR usage.
- Seed the database with baseline Admin/Trainer/Client users to exercise RLS policies during development.
