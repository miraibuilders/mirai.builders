# UI Redesign Integration Handoff

Date: 2026-11-24. The previous production-fallback handoff and `docs/ui-redesign-brief.md` were read first.

## Current state

The zip-based public and internal redesign is integrated into the existing Next.js App Router application. Routes, backend queries, server actions, auth guards, PDF generation, scanner logic, database schema, and test contracts are unchanged. The working tree is ready for a single commit and push; the prior uncommitted evidence logs and two pre-existing upload PNGs were left untouched.

## Changed files

- Public site:
  - `apps/web/src/features/landing/landing.css`
  - `apps/web/src/features/landing/components/brand-mark.tsx`
  - `apps/web/src/features/landing/components/landing-sections.tsx`
  - `apps/web/src/features/landing/components/editorial-sections.tsx`
  - `apps/web/src/features/landing/components/legal-page-view.tsx`
  - `apps/web/src/features/landing/components/sticky-action-bar.tsx`
  - `apps/web/src/app/(marketing)/blog/page.tsx`
  - `apps/web/src/app/(marketing)/blog/[slug]/page.tsx`
  - `apps/web/src/app/(marketing)/error.tsx`
  - `apps/web/public/brand/`
- Internal shell and shared UI:
  - `apps/web/src/app/(app)/_shell/`
  - `apps/web/src/ui/ui.css`
  - `apps/web/src/ui/shell.css`
  - `apps/web/src/ui/banner.tsx`
  - `apps/web/src/ui/page-header.tsx`
  - `apps/web/src/ui/toast.tsx`
- CRM, CMS, documents, settings, login, and dev screens:
  - `apps/web/src/app/(app)/dashboard/`
  - `apps/web/src/app/(app)/leads/`
  - `apps/web/src/app/(app)/contact-requests/`
  - `apps/web/src/app/(app)/documents/`
  - `apps/web/src/app/(app)/cms/`
  - `apps/web/src/app/(app)/settings/dnc/`
  - `apps/web/src/app/login/`
  - `apps/web/src/app/dev/`
  - `apps/web/src/lib/dashboard-metrics.ts`
- Data and deployment cleanup:
  - `apps/web/scripts/seed-demo-data.ts`
  - `apps/web/scripts/seed-dev-users.ts`
  - `apps/web/src/content/site.ts`
  - `apps/web/src/app/robots.ts`
  - `apps/web/src/lib/site.ts`
  - `apps/web/scripts/stage5-e2e.ts`
  - `apps/web/scripts/stage6-e2e.ts`
  - `docs/ui-redesign-brief.md`

## Decisions made

- Used the zip as the visual reference while preserving every existing route, selector, server action, field name, ARIA label, redirect notice, and query parameter used by tests.
- Used vanilla CSS with the existing token system; no Tailwind, component library, runtime font fetching, new dependency, paid service, or test edit was added.
- Used the supplied Japanese zip copy verbatim where available and fictional, production-looking demo data elsewhere; no personal names, emails, or phone numbers were extracted by the scanner.
- Kept Noto Sans JP build-time loading and local PDF font embedding intact.
- Removed AI crawler rules from `robots.ts` and kept only the general `*` rule.
- Added a Vercel `VERCEL_URL` origin fallback in `site.ts`; `SITE_ORIGIN` still wins for the Cloudflare-facing custom domain.
- Replaced hardcoded `/tmp/opencode/bin/pnpm` paths in stage 5/6 E2E scripts with `PNPM_PATH` fallback to `pnpm` so the scripts are portable.
- Corrected `DocumentRow.issueDate` to the database string type, fixed `DataTable` prop usage, and replaced lead-detail `isOverdue` input with direct date/stage evaluation.
- Ignored generated E2E failure artifacts and removed E2E-uploaded PNGs; the two uploads that predate this work remain uncommitted.

## Checks run

- `pnpm typecheck`: passed.
- `pnpm lint`: passed; only the existing Next.js `next lint` deprecation notice was printed.
- `pnpm build`: passed with all 39 routes generated or marked dynamic as expected.
- `DATABASE_URL=... pnpm test`: passed; 3 db tests, 28 web tests, and 33 worker tests all passed.
- `pnpm --filter web test:e2e:full`: passed with `INDEXNOW_ENABLED=true`; 73 passed and 1 skipped out of 74.
- `git diff --check`: passed before commit.
- Full E2E ran against local Postgres at `127.0.0.1:5433`, the local worker, and the Next dev server.

## Known risks

- Production requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SITE_ORIGIN`, `GOTENBERG_URL`, and related existing env vars to be set on Vercel. Cloudflare remains an external proxy in front of the Vercel origin.
- PDF rendering depends on the existing local Noto Sans JP assets and Gotenberg endpoint configuration.
- One E2E test remains intentionally skipped by the suite.
- Visual checks were covered through the existing E2E assertions rather than a separate screenshot review.
