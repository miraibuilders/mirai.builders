Read AGENTS.md and docs/00-master-spec.md. This is stage 1 of 6.

Goal: create the monorepo scaffold and the database foundation.
Do not build any UI, scanner, CRM, or CMS yet.

Deliver:

1. pnpm workspace root with `apps/web` (Next.js App Router) and
   `apps/worker` (Node TypeScript).
2. `apps/web` with route groups `(marketing)` and `(app)`.
3. Postgres connection module and migration setup.
4. Better Auth configured with admin/editor/viewer roles and the `users` table.
5. A `health` API route that checks the database connection.
6. `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

Do not install paid services. Do not add a CMS or admin UI.
When done, overwrite state/handoff.md with changed files, decisions, and checks.
