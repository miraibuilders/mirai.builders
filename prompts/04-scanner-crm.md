Read AGENTS.md, docs/00-master-spec.md, docs/01-examples.md, and state/handoff.md.
This is stage 4 of 6.

Goal: build the passive scanner, the scoring module, and the CRM pipeline.
Do not build the CMS or the blog yet.

Deliver:

1. `scans` table and a worker in `apps/worker` that claims jobs with
   `FOR UPDATE SKIP LOCKED`.
2. Passive checks only: TLS, security headers, PHP/CMS version,
   SPF/DKIM/DMARC, exposed `.git`/`.env`/backup paths.
3. A pure scoring module with weights in one config object and unit tests.
4. `leads` table and a `/leads` page with a Kanban board and a table view.
   One board with a segment filter, not separate boards.
5. A `preferred_template` field on leads, nullable, defaulting to `branded`.
6. One test that asserts the scanner never writes a personal name, email,
   or phone number to the database.
7. `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

When done, overwrite state/handoff.md.
