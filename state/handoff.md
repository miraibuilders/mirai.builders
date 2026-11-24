# Production Fallback Handoff — public site without a DB

Date: 2026-11-24. The previous landing handoff was read first. The user approved static-safe production mode with `go`. Work is complete and verified. This handoff is included in the production fallback commit.

## Current state

- The public site can render from bundled `siteContent` when the production database is unavailable.
- Public routes use `withPublicFallback`: `/`, `/blog`, `/blog/[slug]`, `/sitemap.xml`, and `/llms.txt`.
- `/api/health` reports `{"status":"error","database":"disconnected"}` with HTTP `503` when the DB is absent; it does not expose DB error details.
- Contact form DB failures are reported to staff and return a generic localized user message. No form data, names, emails, or phone numbers are sent to staff alerts.
- Unexpected public errors render a bilingual maintenance screen with no raw error message.
- `notifyStaff()` logs `[STAFF_ALERT]` by default. If `STAFF_ALERT_WEBHOOK_URL` is set, it posts a Slack-compatible `{ text }` payload with `AbortSignal.timeout(5000)`.
- `POST /api/staff-alert` accepts sanitized `digest` and `reason` values only; it uses fixed route `public`.
- Local `.env.production` exists with `SITE_ORIGIN=https://mirai.builders`, generated secrets, empty `DATABASE_URL`, IndexNow disabled, and empty `STAFF_ALERT_WEBHOOK_URL`. It is ignored by git and was not pasted in chat.
- `.nvmrc` pins Node `20`; package `engines.node` was already `20.x`. The earlier Vercel build used Node `v26.13.1`, so the Vercel dashboard Node setting still needs checking.
- Git repo exists with origin `https://github.com/miraibuilders/mirai.builders.git`; the first push reached `293ed0e`, and the production fallback follow-up is included in a separate commit.
- Local Postgres was restarted on `127.0.0.1:5433` with socket dir `/tmp/opencode/pg`; local web and worker dev processes were used for verification.
- Final local DB state is restored with `pnpm seed:demo`: leads `14`, activities `21`, scans `14`, contacts `7`, documents `6`, posts `7`, authors `3`, media `4`, DNC `5`.
- Runtime env for web verification: `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/mirai_lab`, `BETTER_AUTH_SECRET=local-dev-mirai-lab-secret`, `BETTER_AUTH_URL=http://localhost:3000`, `SITE_ORIGIN=http://localhost:3000`, `INDEXNOW_ENABLED=true`, `INDEXNOW_ENDPOINT=http://127.0.0.1:4010/indexnow`, `INDEXNOW_KEY=dev-indexnow-key-9f3a1c7b`, `SCAN_POLL_MS=1000`. pnpm shim: `/tmp/opencode/bin/pnpm`.
- Evidence is under `state/evidence/landing/`.

## In scope (completed)

- Added DB-absent fallbacks for all public content routes and sitemap/llms output.
- Added staff alert utility with a five-minute in-memory throttle and log-only fallback.
- Added maintenance error boundaries for marketing routes and the root error boundary.
- Added a sanitized staff alert API route used by client error boundaries.
- Added health and contact alerting without leaking DB details or personal data.
- Added a local, ignored production env template and Node version pin.
- Initialized the git repository, resolved the remote `.gitignore` conflict, and pushed the prior stage to GitHub.
- Verified static-safe behavior with `DATABASE_URL` unset and verified full behavior with the local DB and worker running.

## Out of scope (not built or altered)

- No production database was provisioned or configured on Vercel.
- No Slack webhook was configured; only the env placeholder exists.
- No Vercel dashboard settings were changed.
- No paid services, paid SDKs, paid APIs, Tailwind, or heavy component library.
- No scanner, auth guard, PDF font, schema, migration, or dependency changes.
- No personal data extraction from scanned sites.
- No Vercel deployment or live verification after the push.
- No Japanese copy generated here; existing copy remains drafted for Mika approval.

## Changed files

- `.gitignore` — combined remote and local ignores; ignores `.env`, `.env.*`, `.env.production`, and `accounts.txt`.
- `.nvmrc` — new Node `20` pin.
- `.env.production` — new ignored production env file; not tracked and not shown in chat.
- `apps/web/src/lib/public-content.ts` — new `withPublicFallback<T>()` helper.
- `apps/web/src/lib/staff-alert.ts` — new `notifyStaff()`, throttle, Slack-compatible webhook payload, log fallback.
- `apps/web/src/lib/settings.ts` — added `loadPublicSiteContent()`.
- `apps/web/src/app/(marketing)/layout.tsx` — uses `loadPublicSiteContent()`.
- `apps/web/src/app/(marketing)/page.tsx` — uses `loadPublicSiteContent()`.
- `apps/web/src/app/(marketing)/blog/page.tsx` — uses `withPublicFallback`.
- `apps/web/src/app/(marketing)/blog/[slug]/page.tsx` — uses `withPublicFallback` in metadata and page render.
- `apps/web/src/app/sitemap.ts` — uses `withPublicFallback`.
- `apps/web/src/app/llms.txt/route.ts` — uses `withPublicFallback` for settings and posts.
- `apps/web/src/app/api/health/route.ts` — alerts staff and returns a generic disconnected DB status.
- `apps/web/src/app/api/staff-alert/route.ts` — new sanitized public error-alert endpoint.
- `apps/web/src/app/(marketing)/error.tsx` — new marketing maintenance error boundary.
- `apps/web/src/app/global-error.tsx` — new root maintenance error boundary.
- `apps/web/src/app/(marketing)/actions.ts` — alerts staff on contact DB failure; returns a generic localized message.
- `state/evidence/landing/build-production-ready.log` — final build evidence.
- `state/evidence/landing/no-db-dev.log` — DB-absent route verification.
- `state/evidence/landing/test-production-ready.log` — final unit test evidence.
- `state/evidence/landing/e2e-production-ready.log` — final full E2E evidence.
- `state/evidence/landing/seed-demo-production-ready.log` — final demo seed evidence.
- `state/evidence/landing/dev-production-ready.log` — final dev server evidence.
- `state/evidence/landing/worker-production-ready.log` — final worker evidence.
- `state/handoff.md` — overwritten with this handoff.

## Decisions

1. DB absence on public pages is treated as a normal static-safe state; only unexpected errors show the maintenance UI and alert staff.
2. Public fallbacks use bundled `siteContent` and keep the existing CMS merged-content shape, so no component contracts changed.
3. Staff alerts never include form data, names, emails, phone numbers, raw error objects, or DB connection details.
4. Staff alerts log by default when the webhook is empty; this keeps the current deployment functional without adding a service.
5. In-memory throttling is per serverless instance; it reduces duplicate alerts but is not a durable global rate limit.
6. The client error boundary sends only a sanitized digest and reason to `/api/staff-alert`.
7. Production env keeps `DATABASE_URL` empty and disables IndexNow because no production DB, IndexNow key, Gotenberg URL, or PDF renderer was supplied.
8. DB-backed admin/CMS/blog publishing/contact persistence stay disabled until a production DB is configured.
9. Node `20` was pinned in the repository because the Vercel build log showed `v26.13.1` against `engines.node: 20.x`.
10. The production fallback changes were kept local until the user explicitly requested a push, then committed as a follow-up to `293ed0e`.
11. E2E scan tests require the worker process. The first run failed on scan waits because no worker was running; the final run passed after `pnpm --filter worker dev` was started.

## Checks run (exact output)

```
$ pnpm typecheck                                       → Done
  packages/db, apps/web, apps/worker: no errors
$ pnpm lint                                            → LINT_EXIT=0
  apps/web: No ESLint warnings or errors
$ pnpm build                                           → BUILD_EXIT=0
  compiled successfully in 10.6s; 7/7 static pages;
  route list includes ƒ /api/staff-alert
$ pnpm test                                            → TEST_EXIT=0
  packages/db: 3 pass, 0 fail
  apps/worker: 33 pass, 0 fail
  apps/web: 28 pass, 0 fail
$ pnpm --filter @mirai/web test:e2e:full               → E2E_FULL_EXIT=0
  1 skipped, 73 passed (8.6m)
$ pnpm seed:demo                                       → SEED_DEMO_EXIT=0
  leads 14, activities 21, scans 14, contacts 7,
  documents 6, posts 7, authors 3, media 4, dnc 5
$ no-DB curl checks                                    → ROOT 200, /blog 200,
  /privacy 200, /terms 200, /tokushoho 200,
  /security-policy 200, /sitemap.xml 200, /llms.txt 200,
  /api/health 503
$ no-DB root HTML                                      → expected headline once,
  "Application error" count 0
$ no-DB /api/health                                    → {"status":"error","database":"disconnected"}
$ POST /api/staff-alert                                → {"ok":true}, HTTP 200
$ DB-up /api/health                                    → {"status":"ok","database":"connected"}
$ git status --short                                   → production fallback files are uncommitted
```

## Known risks / follow-ups

- Import or copy `.env.production` into Vercel before redeploying; do not commit it.
- Set `STAFF_ALERT_WEBHOOK_URL` when the Slack webhook is ready; until then alerts are only server logs.
- Confirm Vercel uses Node `20`; `.nvmrc` alone may not override an existing project setting.
- Without `DATABASE_URL`, admin/CMS/blog publishing/contact persistence remain unavailable by design.
- The Vercel runtime error digest `1198609198` was not matched to runtime logs; no explicit runtime stack trace was provided.
- Mika must approve the drafted Japanese landing and legal copy and inferred business/legal values before treating them as final.
- English is client-side only; no `/en` routes, hreflang, or English SEO metadata.
- `seed:demo` is destructive to local business tables and must never be run against production-like data.
- `git status --short` shows untracked E2E upload artifacts under `apps/web/public/uploads/site/`; do not commit them accidentally.
- `state/evidence/landing/dev-complete.log` and `state/evidence/lb1/worker.log` were already modified before this stage; review before committing evidence logs.
- Vercel deployment still needs to be triggered and verified after the push.

## Next stage

Read this handoff first. After the production fallback push, deploy the new code, import `.env.production` into Vercel, set the Slack webhook when ready, confirm Node `20`, and verify the live public routes. Check `git status --short` and decide which evidence and upload artifacts to keep. Configure a production DB later when DB-backed CMS, contact, or admin features are required.
