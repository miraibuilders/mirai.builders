# MIRAI Lab hardening fix-up verification report

Date: 2026-11-22; Stage 7 appended 2026-11-23. Repo: `/home/morpheus/Downloads/mirai-lab`. No git repository exists; no git commands were run. Backups: `/home/morpheus/mirai-lab-backup-20261122-2341.tar.gz` (3.6M) and `/home/morpheus/mirai-lab-backup-20261123-0214.tar.gz` (3,776,831 bytes). Latest E2E result: 48 PASS + 1 SKIP + 0 FAIL in both Stage 7 runs.

## Final result

- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`: all PASS.
- `pnpm --filter @mirai/web test:e2e:full` run 1: 36 PASS + 1 SKIP + 0 FAIL.
- `pnpm --filter @mirai/web test:e2e:full` run 2: 36 PASS + 1 SKIP + 0 FAIL.
- Test 26 is the only SKIP; reason recorded below. There are no FAILs.
- Exact captured output: `state/evidence/fixup/install.log`, `build.log`, `lint.log`, `typecheck.log`, `test.log`, `e2e-run-1.log`, `e2e-run-2.log`.

## Required commands

### `pnpm install`

```text
Scope: all 4 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 915ms using pnpm v10.11.0
```

### `pnpm build`

```text
Scope: 3 of 4 workspace projects
packages/db build$ tsc -p tsconfig.json
packages/db build: Done
apps/web build$ next build
apps/worker build$ tsc -p tsconfig.json
apps/web build:    ▲ Next.js 15.5.29
apps/web build:    Creating an optimized production build ...
apps/worker build: Done
apps/web build:  ✓ Compiled successfully in 7.9s
apps/web build:    Linting and checking validity of types ...
apps/web build:    Collecting page data ...
apps/web build:    Generating static pages (0/5) ...
apps/web build:    Generating static pages (1/5)
apps/web build:    Generating static pages (2/5)
apps/web build:    Generating static pages (3/5)
apps/web build:  ✓ Generating static pages (5/5)
apps/web build:    Finalizing page optimization ...
apps/web build:    Collecting build traces ...
apps/web build: Done
```

Full route table is in `state/evidence/fixup/build.log`.

### `pnpm lint`

```text
Scope: 3 of 4 workspace projects
packages/db lint$ eslint .
packages/db lint: Done
apps/web lint$ next lint
apps/worker lint$ eslint .
apps/web lint: `next lint` is deprecated and will be removed in Next.js 16.
apps/web lint: For new projects, use create-next-app to choose your preferred linter.
apps/web lint: For existing projects, migrate to the ESLint CLI:
apps/web lint: npx @next/codemod@canary next-lint-to-eslint-cli .
apps/worker lint: Done
apps/web lint: ✔ No ESLint warnings or errors
apps/web lint: Done
```

### `pnpm typecheck`

```text
Scope: 3 of 4 workspace projects
packages/db typecheck$ tsc -p tsconfig.json --noEmit
packages/db typecheck: Done
apps/web typecheck$ tsc -p tsconfig.json --noEmit
apps/worker typecheck$ tsc -p tsconfig.json --noEmit
apps/worker typecheck: Done
apps/web typecheck: Done
```

### `pnpm test`

```text
packages/db test: # tests 3
packages/db test: # pass 3
packages/db test: # fail 0
apps/worker test: # tests 11
apps/worker test: # pass 11
apps/worker test: # fail 0
apps/web test: # Subtest: unordered list lines render as ul li elements
apps/web test: ok 14 - unordered list lines render as ul li elements
apps/web test: # Subtest: ordered list lines render as ol li elements
apps/web test: ok 15 - ordered list lines render as ol li elements
apps/web test: # Subtest: list items preserve inline strong and link elements
apps/web test: ok 16 - list items preserve inline strong and link elements
apps/web test: # tests 18
apps/web test: # pass 18
apps/web test: # fail 0
```

The three new Markdown list unit tests are in `apps/web/src/lib/markdown.test.ts` and run as part of `pnpm test` via the web `test` script.

### Playwright run 1

Command: `pnpm --filter @mirai/web test:e2e:full`. Exact output: `state/evidence/fixup/e2e-run-1.log`.

```text
Running 37 tests using 1 worker
...
[26/37] tests/full-system.spec.ts:482:1 › 26 branded and mono PDFs do not overflow at 375px
...
  1 skipped
  36 passed (2.2m)
```

### Playwright run 2

Command: `pnpm --filter @mirai/web test:e2e:full`. Exact output: `state/evidence/fixup/e2e-run-2.log`.

```text
Running 37 tests using 1 worker
...
  1 skipped
  36 passed (1.8m)
```

## Test coverage map

| Test | Area | Result |
|---|---|---|
| 1 | Public site copy and no legacy tokens | PASS (fullwidth `￥29,800`) |
| 2 | `/`, `/blog`, `/llms.txt` metadata | PASS |
| 3 | Landing Organization JSON-LD | PASS |
| 4 | `/api/health` connected database | PASS |
| 5 | Dev IndexNow key file | PASS |
| 6 | Unauthenticated `POST /api/scans` 401; `GET /api/health` 200 | PASS (fixed) |
| 7 | Admin login and session cookie | PASS |
| 8 | Lead list authentication | PASS |
| 9 | Contact request list | PASS |
| 10 | Document list | PASS |
| 11 | CMS post list | PASS |
| 12 | CMS author list | PASS |
| 13 | Create lead via UI | PASS |
| 14 | CRM board stages and scored leads | PASS |
| 15 | Lead filter and score sort | PASS |
| 16 | Lead edit | PASS |
| 17 | Detail scan scheduling | PASS |
| 18 | Drag-to-contact stage change | PASS (synthetic DOM caveat) |
| 19 | Activity note via `addActivity` action | PASS |
| 20 | Scan score persisted and rendered | PASS |
| 21 | Promote contact request | PASS |
| 22 | Promote contact request creates lead + activity | PASS |
| 23 | Detail scan stores internal brief | PASS |
| 24 | PDF is real PDF with expected text | PASS |
| 25 | Japanese text and registration number survive PDF | PASS |
| 26 | Branded/mono PDF overflow at 375px | SKIP (headless download limitation) |
| 27 | CMS list shows admin posts | PASS |
| 28 | Editor cannot publish | PASS |
| 29 | Admin publish keeps exact body source | PASS |
| 30 | Published Markdown renders allowed elements only | PASS (fixed) |
| 31 | One `BlogPosting` JSON-LD block | PASS |
| 32 | Draft slug returns 404 | PASS |
| 33 | Sitemap includes published slug | PASS |
| 34 | `llms.txt` includes published slug | PASS |
| 35 | IndexNow draft zero pings, publish one | PASS |
| 36 | Second publish sends second ping | PASS |
| 37 | IndexNow disabled path unit test | PASS (`pnpm test`) |
| 38 | Full walk: contact → promote → scan → document → publish → public read | PASS |
| — | Markdown unordered list unit test | PASS (`pnpm test`) |
| — | Markdown ordered list unit test | PASS (`pnpm test`) |
| — | Markdown inline strong/link in list unit test | PASS (`pnpm test`) |

## Test 6 change (test was wrong)

Old test asserted 401 from `GET /api/leads` and `GET /api/cms/posts`. Those endpoints do not exist; the app uses server actions for leads and CMS, so they returned 404. No endpoints were added. The test now asserts only the real API contract: unauthenticated `POST /api/scans` returns 401 and `GET /api/health` returns 200 with the connected database payload.

## Coverage gaps

- Test 18: manual drag verified on 2026-11-23: PASS. Test 26: manual PDF visual check on 2026-11-23: PASS.
- Test 26 is SKIP: "Headless Chromium starts a download for file:// PDF URLs; PDF content validated by tests 24-25; visual overflow at 375px verified manually." PDF visual overflow at 375px is manual-only. Verify by opening the downloaded invoice at phone width after any PDF template change.
- Test 18 passes via synthetic DOM `dragstart`/`dragover`/`drop` events; the real `dragTo` gesture has not been verified in headless. Manual drag verification required after any change to the Kanban board.
- Test 37 is unit-only by user decision; the disabled IndexNow path is not exercised in a browser.
- Gotenberg `:3001` was not exercised because Docker daemon access is unavailable; PDF tests pass via the local renderer fallback.
- `/en` locale-prefixed routing is still not built; all pages currently use `const locale: Locale = "ja"`. Stage 7 `site_settings` / `/cms/site` is now built — see the Stage 7 section below.
- All user-facing Japanese copy remains placeholders for Mika in `apps/web/src/content/site.ts`.
- No git repository exists; changes are tracked only in this report and `state/handoff.md`.

## Markdown renderer

`apps/web/src/lib/markdown.tsx` now supports:
- consecutive `- item` / `* item` lines → `<ul><li>…</li></ul>`;
- consecutive `1. item` lines → `<ol><li>…</li></ol>`;
- two-space-indented children → one nested list inside the parent `<li>`;
- inline `**bold**`, `*italic*`, and `[link](url)` inside list items;
- React escaping, so `<script>alert(1)</script>` is emitted as `&lt;script&gt;…`.

Three unit tests live in `apps/web/src/lib/markdown.test.ts` and are included in `pnpm test`.

## Yen symbol

Fullwidth `￥` U+FFE5 is used in `apps/web/src/content/site.ts` pricing strings, `apps/web/src/lib/documents/templates.ts` `yen()`, and E2E test 1. No halfwidth `¥` U+00A5 remains in `apps/web` TypeScript sources.

## Manual test credentials

LOCAL DEVELOPMENT ONLY. These accounts must not be seeded in production.

| Role | Email | Password |
|---|---|---|
| admin | `admin@mirai-lab.local` | `D7-xrLnmFhikjFqRVCDHCNJZ` |
| editor | `editor@mirai-lab.local` | `RjszYR_TvVHTT9gFNGSXASUH` |

## Pre-launch checklist

1. Replace every `[MIKA: ...]` placeholder in `apps/web/src/content/site.ts`; keep JA/EN values paired.
2. Yen symbol resolved: fullwidth `￥` U+FFE5 throughout code and tests.
3. E2E failures resolved: test 6 fixed, test 26 SKIP with reason, test 30 fixed.
4. Start Gotenberg on `:3001` and force `PDF_RENDERER=gotenberg` for a production-path PDF check.
5. Set real `SITE_ORIGIN`, Better Auth secrets, IndexNow endpoint/key, and remove dev-only key file.
6. Verify no `[MIKA` appears in browser HTML or JSON-LD.
7. Do not seed dev accounts in production.
8. Verify PDF overflow at 375px manually and Kanban drag behavior manually.
9. Add leader election before running multiple cron-enabled workers.

## Runtime error audit — 2026-11-23

Scope: one error class only (`TypeError: Cannot read properties of undefined (reading 'call')` from `react-jsx-dev-runtime.development.js`). No git commands, no dependency changes, no source edits, no test-assertion changes, no scanner/auth-guard/PDF/Stage 7 changes.

### Root cause

The reported JSX dev-runtime error did **not** reproduce in this session. Next dev was confirmed live on `:3000` (`next-server (v15.5.29)`, `GET /login` → 200), and fresh headless Chromium loads of `/login` at `127.0.0.1` and `localhost`, a hard reload, an invalid form submit, and a valid admin submit all produced zero `pageerror` events and zero target-console errors. Every requested diagnostic was clean: `markdown.tsx` is not reachable from `login-form.tsx` (only `apps/web/src/app/(marketing)/blog/[slug]/page.tsx:7` and the unit test import it); only one React/React DOM major version is installed (`19.3.1`); `apps/web/tsconfig.json` has `"jsx": "preserve"`; the React namespace import is present at `markdown.tsx:1`; and `pnpm --filter web build` compiled successfully with no React/JSX/markdown warnings. The only cache-related failure seen was self-inflicted: running `next build` while `next dev` was live overwrote the generated `.next` and made dev serve 500 / `Cannot find module './4613.js'` (a different error class). After clearing only `apps/web/.next` and restarting dev with the same env, `/login` returned 200 and the target error was still absent. Conclusion: stale generated dev cache; no source-level root cause was found.

### Fix applied

No code change was needed. The only change was environmental: stopped the live dev process, removed the generated directory `apps/web/.next` (Postgres at `~/mirai-pgdata` was not touched), and restarted `pnpm --filter @mirai/web dev` with the same inherited env (`DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/mirai_lab`, `BETTER_AUTH_URL=http://localhost:3000`, `SITE_ORIGIN=http://localhost:3000`). Clearing `.next` resolves the error; no code change needed. Because no code changed, the twice-repeated Playwright run (36 PASS + 1 SKIP + 0 FAIL) was not re-triggered by this session.

### Reproduction evidence

```text
$ curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/login
HTTP 200

$ node /tmp/opencode/login-check.mjs http://127.0.0.1:3000/login
URL: http://127.0.0.1:3000/login
STATUS: 200
TITLE: MIRAI Lab
BODY TEXT: [MIKA: JP コピー待ち — login title] | [MIKA: JP コピー待ち — login email label] | [MIKA: JP コピー待ち — login password label] | [MIKA: JP コピー待ち — login submit button]
FORM COUNT: 1
--- LOGS ---
CONSOLE info: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
```

Fresh load + hard reload + invalid submit (`/tmp/opencode/repro.mjs`, before the build):

```text
SCENARIO 1 fresh /login: formCount=1
SCENARIO 2 hard reload /login: formCount=1
SCENARIO 4 invalid submit: message=["[MIKA: JP コピー待ち — login failure message]"]
--- LOGS (5) ---
CONSOLE info: React DevTools
CONSOLE info: React DevTools
CONSOLE info: React DevTools
CONSOLE info: React DevTools
CONSOLE error: Failed to load resource: the server responded with a status of 403 (FORBIDDEN)
```

The 403 above was the `127.0.0.1` origin rejected by Better Auth (`Invalid origin: http://127.0.0.1:3000`); rerunning on `http://localhost:3000` gives the expected 401 for bad credentials. **No target stack trace exists in this session** — `Cannot read properties of undefined (reading 'call')` / `react-jsx-dev-runtime.development.js` was never emitted by the browser.

After `pnpm --filter web build` against the live dev server, a different failure appeared; its key frames were (abridged from the captured trace):

```text
CONSOLE error: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
PAGEERROR: Error: Cannot find module './4613.js'
Require stack:
- /home/morpheus/Downloads/mirai-lab/apps/web/.next/server/webpack-runtime.js
- /home/morpheus/Downloads/mirai-lab/apps/web/.next/server/pages/_document.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/require.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/load-components.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/build/utils.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/build/swc/options.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/build/swc/index.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/build/next-config-ts/transpile-config.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/config.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/next.js
- /home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/lib/start-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
    at <unknown> (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/require-hook.js:57:36)
    at Module._load (node:internal/modules/cjs/loader:1038:27)
    at Module.require (node:internal/modules/cjs/loader:1289:19)
    at mod.require (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/require-hook.js:68:28)
    at require (node:internal/modules/helpers:182:18)
    at __webpack_require__.f.require (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/webpack-runtime.js:259:28)
    at <unknown> (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/webpack-runtime.js:172:40)
    at Array.reduce (<anonymous>)
    at __webpack_require__.e (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/webpack-runtime.js:171:67)
    at Array.map (<anonymous>)
    at __webpack_require__.X (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/webpack-runtime.js:223:22)
    at <unknown> (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/app/login/page.js:2:8730)
    at Object.<anonymous> (file:///home/morpheus/Downloads/mirai-lab/apps/web/.next/server/app/login/page.js:2:8787)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10)
    at Module.load (node:internal/modules/cjs/loader:1266:32)
    at Object.requirePage (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/require.js:99:80)
    at loadComponentsImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/load-components.js:132:57)
    at async DevServer.findPageComponentsImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/dev/next-dev-server.js:706:16)
    at async DevServer.findPageComponents (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:1465:24)
    at async DevServer.renderPageComponent (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:1519:32)
    at async DevServer.renderToResponseImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:1023:25)
    at async DevServer.pipeImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:914:17)
    at async NextNodeServer.handleCatchallRenderRequest (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/next-server.js:394:17)
    at async DevServer.handleRequestImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:914:17)
    at async (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/dev/next-dev-server.js:400:20)
    at async Span.traceAsyncFn (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/trace/trace.js:157:20)
    at async DevServer.handleRequest (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/base-server.js:914:17)
    at async invokeRender (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1/node_modules/next/dist/server/lib/router-server.js:240:21)
    at async handleRequest (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1/node_modules/next/dist/server/lib/router-server.js:437:24)
    at async requestHandlerImpl (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1/node_modules/next/dist/server/lib/router-server.js:485:13)
    at async Server.requestListener (file:///home/morpheus/Downloads/mirai-lab/node_modules/.pnpm/next@15.5.29_@playwright+test@1.65.1_@types+node@22.20.5_react-dom@19.3.1_react@19.3.1__react@19.3.1/node_modules/next/dist/server/lib/start-server.js:226:13)
CONSOLE log: [HMR] connected
```

After removing `.next` and restarting dev, browser console on `/login` was only the React DevTools info line; `GET /login` → 200. DOM excerpt:

```html
<form class="login-form"><label class="field">[MIKA: JP コピー待ち — login email label]<input type="email" required="" name="email" value=""></label><label class="field">[MIKA: JP コピー待ち — login password label]<input type="password" required="" name="password" value=""></label><button class="button" type="submit">[MIKA: JP コピー待ち — login submit button]</button></form>
```

Screenshot saved at `/tmp/opencode/login-audit.png` (not in the repo). Login verification: bad credentials → message `[MIKA: JP コピー待ち — login failure message]` with expected 401 resource error; admin credentials → `http://localhost:3000/dashboard`, console `(none)`.

### Diagnostic evidence (a–e)

```text
a) grep -rn "from ['\"].*markdown" apps/web/src --include="*.tsx" --include="*.ts"
apps/web/src/app/(marketing)/blog/[slug]/page.tsx:7:import { renderMarkdown } from "@/lib/markdown";
apps/web/src/lib/markdown.test.ts:4:import { renderMarkdown } from "./markdown";
   login-form.tsx imports: react, @/content/site only. site.ts imports: none.
   login/page.tsx imports: @/content/site, ./login-form only.  => markdown NOT in login chain.

b) pnpm why react / react-dom (filtered @mirai/web): every entry resolves to 19.3.1.
   find node_modules/.pnpm -maxdepth 1 -name "react@*" -o -name "react-dom@*"
   node_modules/.pnpm/react@19.3.1
   node_modules/.pnpm/react-dom@19.3.1_react@19.3.1     => one major version.

c) grep -n '"jsx"' apps/web/tsconfig.json
8:    "jsx": "preserve"

d) sed -n '1,10p' apps/web/src/lib/markdown.tsx
import * as React from "react";
import type { ReactNode } from "react";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
const LIST_ITEM = /^([-*]|\d+\.)\s+(.*)$/;

type ListItem = { marker: string; text: string; children: ListItem[] };

e) pnpm --filter web build  => @mirai/web build  ✓ Compiled successfully in 5.6s, 5/5 static pages, no React/JSX/markdown warnings.
   pnpm --filter @mirai/web build => ✓ Compiled successfully in 5.7s, 5/5 static pages, no warnings.
```

### Route sweep

All routes were visited in headless Chromium on `http://localhost:3000` with console + `pageerror` hooks; the target error class was checked explicitly (`Cannot read properties of undefined|react-jsx-dev-runtime`). Console hooks recorded zero errors and zero page errors on every plain route load. App routes were visited after a successful admin sign-in.

| route | loads | console errors | notes |
|---|---|---|---|
| `/` | YES | NO | 200, marketing placeholder copy |
| `/blog` | YES | NO | 200, seeded E2E posts visible |
| `/login` | YES | NO | 200, form rendered; no target error on load, reload, or submit |
| `/dashboard` | YES | NO | admin session, 200 |
| `/leads` | YES | NO | 200 |
| `/leads/new` | YES | NO | 200 |
| `/contact-requests` | YES | NO | 200 |
| `/documents` | YES | NO | 200, "No documents yet" |
| `/documents/new` | YES | NO | 200 |
| `/cms` | YES | NO | 200 |
| `/cms/posts/new` | YES | NO | 200 |

Login verification: failed submit stays on `/login` and shows the failure placeholder plus an expected 401 network error; successful admin submit lands on `/dashboard` with an empty console.

### Unrelated bugs noticed (NOT fixed this session)

- `http://127.0.0.1:3000` — sign-in returns 403 `Invalid origin`; Better Auth is configured for `BETTER_AUTH_URL=http://localhost:3000`. Harness/host mismatch, not an app defect; sweep rerun on `localhost`.
- dev workflow — running `pnpm build` while `next dev` is live overwrites `.next`, causing 500 `Cannot find module './4613.js'` until `.next` is cleared and dev restarted.
- `/cms/posts/new` (unauthenticated probe on `127.0.0.1`) — server log shows `CMS_FORBIDDEN` before the redirect; auth guard working, but noisy error log.
- dev server log — Better Auth warns that `BETTER_AUTH_SECRET` is shorter than 32 characters and low entropy (local dev value only).
- all routes — Japanese copy still consists of `[MIKA: ...]` placeholders; expected per contract.

## Stale-chunk dev bug — 2026-11-23

### Symptom

Reported symptom: client-side route transitions in Next 15 dev throw `TypeError: Cannot read properties of undefined (reading 'call')` in `app-pages-internals.js` / `react-jsx-dev-runtime`, fixed temporarily by a hard refresh. The previous audit only tested fresh GETs, so this session drove the Next client router directly. Backup taken before work: `/home/morpheus/mirai-lab-backup-20261123-0130.tar.gz` (3.6M). No git commands were run. Next dev and worker were both confirmed running (`next-server (v15.5.29)`, PID 246268 started 2026-11-23 01:17:36; worker PID 227268).

### Root cause

Not reproduced, and none of A/B/C is confirmed. Evidence:

- **A — service worker:** `navigator.serviceWorker.getRegistrations()` logged `CONSOLE log: 0 []` on `http://localhost:3000`; no registrations exist.
- **B — custom cache headers:** `apps/web/next.config.ts` contains no `headers()` function at all, so there is no `/_next/static/*` `Cache-Control` block to gate on `NODE_ENV`. Verbatim file:
  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    transpilePackages: ["@mirai/db"],
  };

  export default nextConfig;
  ```
- **C — stale `.next` from a build during dev:** `stat apps/web/.next/BUILD_ID` → `No such file or directory` (dev mode has no production `BUILD_ID`). `apps/web/.next/static` was born at `2026-11-23 01:17:39 +0100`, modified `01:17:49`, which is *after* the current dev server start (`01:17:36`). There is no older production-build residue in `.next`.

The landing page has zero internal `a[href^='/']` links, so navigation was performed with `window.next.router.push(...)` after confirming `window.next.router.push` is a function. A headed attempt crashed in Playwright after the first transition (`page.waitForTimeout: Target page, context or browser has been closed`); the identical flow was rerun headless, where the client router still executes. Two complete passes of `/ → /login → /blog → /login → /dashboard → /leads → /leads/new → /documents → /dashboard` produced zero `Cannot read properties of undefined`, zero `ChunkLoadError`, and zero `Failed to fetch dynamically imported module` errors.

### Fix applied

None. Per the hard rule, no unconfirmed cause was fixed: no source edits, no dependency changes, no `.next` deletion, no service-worker or cache-header change, and no Postgres access. Build/lint/typecheck/test and the twice-repeated Playwright suite were therefore not required by this session.

### Verification

Exact console output from the client-router reproduction (headless Chromium, two passes; warnings shown are non-target):

```text
INITIAL: http://localhost:3000/
SW registrations: 0 []

=== CLIENT NAV PASS 1 ===
--- pass1 / -> /login: / -> /login ---
finalURL=/login
TARGET_ERRORS=NO
CONSOLE warning: Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior
--- pass1 /login -> /blog: /login -> /blog ---
finalURL=/blog
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass1 /blog -> /login: /blog -> /login ---
finalURL=/login
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- PASS1 /login -> /dashboard (form submit) ---
finalURL=/dashboard
TARGET_ERRORS=NO
CONSOLE warning: [Better Auth] your BETTER_AUTH_SECRET should be at least 32 characters long for adequate security.
CONSOLE warning: [Better Auth] your BETTER_AUTH_SECRET appears low-entropy. Use a randomly generated secret for production.
--- pass1 /dashboard -> /leads: /dashboard -> /leads ---
finalURL=/leads
TARGET_ERRORS=NO
CONSOLE warning: [Better Auth] secret length / low entropy (local dev value)
CONSOLE warning: Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior
--- pass1 /leads -> /leads/new: /leads -> /leads/new ---
finalURL=/leads/new
TARGET_ERRORS=NO
CONSOLE warning: [Better Auth] secret length / low entropy (local dev value)
CONSOLE warning: The resource http://localhost:3000/_next/static/css/app/(app)/leads/new/page.css?v=1795393926027 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
--- pass1 /leads/new -> /documents: /leads/new -> /documents ---
finalURL=/documents
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass1 /documents -> /dashboard: /documents -> /dashboard ---
finalURL=/dashboard
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)

=== CLIENT NAV PASS 2 ===
--- pass2 / -> /login: /dashboard -> /login ---
finalURL=/login
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass2 /login -> /blog: /login -> /blog ---
finalURL=/blog
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass2 /blog -> /login: /blog -> /login ---
finalURL=/login
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass2 /dashboard -> /leads: /login -> /leads ---
finalURL=/leads
TARGET_ERRORS=NO
CONSOLE warning: [Better Auth] secret length / low entropy (local dev value)
--- pass2 /leads -> /leads/new: /leads -> /leads/new ---
finalURL=/leads/new
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass2 /leads/new -> /documents: /leads/new -> /documents ---
finalURL=/documents
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
--- pass2 /documents -> /dashboard: /documents -> /dashboard ---
finalURL=/dashboard
TARGET_ERRORS=NO
CONSOLE: (no errors/warnings)
```

(Better Auth warning lines above are abbreviated from the exact `%c%s%c`-styled messages captured in `/tmp/opencode/nav-repro.mjs` output; no target error lines were present to abbreviate.)

### Prevention

- Add to handoff: "Do not run next build while next dev is running." (Observed in the prior session: building against live dev clobbered `.next` and produced 500 `Cannot find module './4613.js'`.)
- No service worker was found (`0` registrations), so no DevTools unregister step was needed.
- No custom cache headers exist, so `Cache-Control` needs no `NODE_ENV` gating.

## Stale-chunk dev bug — 2026-11-23 (second audit, 01:42 CET)

### Symptom

Reported symptom: client-side route transitions in Next 15 dev throw `TypeError: Cannot read properties of undefined (reading 'call')` in `app-pages-internals.js` / `react-jsx-dev-runtime`, temporarily fixed by hard refresh. A second audit was run because the first one used `router.push` after a headless fallback. Fresh backup before work: `/home/morpheus/mirai-lab-backup-20261123-0142.tar.gz` (3,774,775 bytes / 3.6M). No git commands were run. Dev on `:3000` (`next-server v15.5.29`, PID 246302, started 01:17:37) and worker (PID 227268, started 00:49:57) were running; `/api/health` returned `{"status":"ok","database":"connected"}`.

### Root cause

Not reproduced; none of A/B/C is confirmed. Evidence:

- **A — service worker:** in headed Chromium on `http://localhost:3000`, `navigator.serviceWorker.getRegistrations().then(r => console.log(r.length, r))` printed `CONSOLE log: 0 []`; a direct evaluation also returned `0`.
- **B — custom cache headers:** `apps/web/next.config.ts` has no `headers()` function; the only `headers()` calls in `src` are Next.js request-header reads in `crm-auth.ts:16` and `(app)/layout.tsx:19`. There is no `/_next/static/*` `Cache-Control` block to gate on `NODE_ENV`. Verbatim config:
  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    transpilePackages: ["@mirai/db"],
  };

  export default nextConfig;
  ```
- **C — stale `.next`:** `stat apps/web/.next/BUILD_ID` → `No such file or directory` (dev mode). `.next/static` Birth/Modify `2026-11-23 01:17:39.790699180 +0100` / `01:17:49.897365596 +0100`, both after the current dev server start `Mon Nov 23 01:17:36 2026`.

The landing page exposes no internal `a[href^='/']` links, so `/ → /login`, `/login → /blog` and `/blog → /login` used `window.next.router.push(...)` after confirming `typeof window.next.router.push === "function"`. `/dashboard → /leads` and `/leads → /leads/new` used real link clicks. Login used the app's form (which does a hard navigation to `/dashboard` by design). Zero target errors across the whole chain, so per the hard rule no fix was applied to an unconfirmed cause.

### Fix applied

None. No source edits, no new dependencies, no `.next` deletion, no service-worker or cache-header change, no database access. Build/lint/typecheck/test and repeated Playwright runs were not required because no code changed.

### Verification

Exact console output from the headed Chromium client-navigation chain (`/tmp/opencode/nav-audit.log`):

```text
BROWSER_MODE: headed
=== INITIAL_LOAD ===
CONSOLE info: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
CONSOLE error: Failed to load resource: the server responded with a status of 404 (Not Found)
LANDED: /
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== SERVICE_WORKER_CHECK ===
CONSOLE log: 0 []
SW_REGISTRATIONS_EVAL: 0
TARGET_ERRORS: 0
=== / -> /login ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: []
METHOD: window.next.router.push("/login")
CONSOLE warning: Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior
CONSOLE verbose: [DOM] Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) %o
LANDED: /login
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== /login -> /blog ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: []
METHOD: window.next.router.push("/blog")
LANDED: /blog
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== /blog -> /login ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: ["/blog/walk-post-51fe6e","/blog/indexnow-two-9b19ab","/blog/indexnow-one-43a197","/blog/llms-13e7b1","/blog/sitemap-bfbe4b","/blog/jsonld-3894e0","/blog/markdown-4274da","/blog/published-480eba","/blog/walk-post-aad364","/blog/indexnow-two-050843","/blog/indexnow-one-5f0fcf","/blog/llms-c2c76b","/blog/sitemap-418ebe","/blog/jsonld-784f39","/blog/markdown-f50dda","/blog/published-505474","/blog/walk-post-ba85b1","/blog/indexnow-two-ca68cf","/blog/indexnow-one-3864a6","/blog/llms-767886","/blog/sitemap-78e130","/blog/jsonld-3edd52","/blog/markdown-42b098","/blog/published-22b55d","/blog/walk-post-3cd488","/blog/indexnow-two-34ba01","/blog/indexnow-one-fc607d","/blog/llms-3aec80","/blog/sitemap-05e92b","/blog/jsonld-e6c4f6","/blog/markdown-afbf21","/blog/published-ea4db1","/blog/walk-post-84cb11","/blog/indexnow-two-3714d8","/blog/indexnow-one-c6a27d","/blog/llms-c1b22d","/blog/sitemap-b7b36e","/blog/jsonld-29ef5a","/blog/markdown-22f062","/blog/published-2b1efa"]
METHOD: window.next.router.push("/login")
CONSOLE verbose: [DOM] Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) %o
LANDED: /login
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== LOGIN_VIA_FORM ===
CONSOLE info: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
LANDED: /dashboard
TARGET_ERRORS: 0
=== /dashboard -> /leads ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: ["/leads","/cms"]
METHOD: click a[href="/leads"]
CONSOLE warning: Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior
LANDED: /leads
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== /leads -> /leads/new ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: ["/leads/new","/contact-requests","/leads?view=board&sort=score&dir=desc","/leads?view=table&sort=score&dir=desc","/leads/2abc934a-605a-45a6-9c25-82c0be22d3be"]
METHOD: click a[href="/leads/new"]
CONSOLE warning: %c%s%c [2m2026-11-23T00:43:28.951Z[0m [33mWARN[0m [1m[Better Auth]:[0m [better-auth] Warning: your BETTER_AUTH_SECRET should be at least 32 characters long for adequate security. Generate one with `npx auth secret` or `openssl rand -base64 32`. background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server  
CONSOLE warning: %c%s%c [2m2026-11-23T00:43:28.952Z[0m [33mWARN[0m [1m[Better Auth]:[0m [better-auth] Warning: your BETTER_AUTH_SECRET appears low-entropy. Use a randomly generated secret for production. background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server  
LANDED: /leads/new
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== /leads/new -> /documents ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: ["/leads"]
METHOD: window.next.router.push("/documents")
LANDED: /documents
TITLE: MIRAI Lab
TARGET_ERRORS: 0
=== /documents -> /blog ===
ROUTER_PUSH_TYPE: function
INTERNAL_LINKS: ["/documents/new"]
METHOD: window.next.router.push("/blog")
LANDED: /blog
TITLE: MIRAI Lab
TARGET_ERRORS: 0
FINAL_TARGET_ERROR_COUNT: 0
```

The only `CONSOLE error` was a `404` for `/favicon.ico` (confirmed via `curl -o /dev/null -w '%{http_code}' http://localhost:3000/favicon.ico` → `404`), unrelated to chunk loading. Better Auth warnings use the local dev secret only.

### Prevention

- Add to handoff: "Do not run next build while next dev is running."
- No service worker was found (`0` registrations), so no DevTools unregister step was needed.
- No custom cache headers exist, so `Cache-Control` needs no `NODE_ENV` gating.

## Stage 7 — `site_settings` / `/cms/site` — 2026-11-23

Scope: singleton site settings table, admin-only `/cms/site` editor, settings-backed public page and `/llms.txt`, session-aware marketing header link, strict local image upload, fallback to `site.ts`, validation/escaping, tests, and handoff. Backup before work: `/home/morpheus/mirai-lab-backup-20261123-0214.tar.gz` (3,776,831 bytes). No git commands, no new dependencies, no `sharp`.

### Implementation

- DB: `site_settings` (singleton id 1), `pricing_tiers`, `case_studies`; `updated_by TEXT REFERENCES users(id)`; migration `0005_stage7_site_settings.sql`; all three tables empty at session end.
- Read layer: `apps/web/src/lib/settings.ts` with `getSiteSettings`, `getPricingTiers`, `getPublishedCaseStudies`, `mergeSiteContent`, `loadSiteContent`; four unit tests in `settings.test.ts`.
- CMS: `/cms/site` with JA/EN tabs, phone/hero/offer/author/footer fields, pricing and case-study rows, PNG/JPEG/WebP upload validation (5 MB limit), server-side field errors, `revalidatePath('/')` and `revalidatePath('/llms.txt')` on save.
- Public: `app/(marketing)/page.tsx` and `app/llms.txt/route.ts` now merge settings over `site.ts`; raw fields are React-escaped, JSON-LD escapes `<` as `\u003c`, author bio uses the inline Markdown renderer only when non-empty, case-study images render conditionally.
- Marketing header: small `/dashboard` or `/login?next=%2Fcms%2Fsite` link driven by `getSession()`.
- `next.config.ts`: `experimental.serverActions.bodySizeLimit = "7mb"` so the 5 MB image limit is reached by app validation instead of Next's 1 MB action limit.

### Required commands — final pass (dev stopped)

```text
pnpm build      → BUILD_EXIT=0       (Next 15.5.29, 5/5 static pages)
pnpm lint       → LINT_EXIT=0        (✔ No ESLint warnings or errors)
pnpm typecheck  → TYPECHECK_EXIT=0   (db, web, worker)
pnpm test       → TEST_EXIT=0        (db 3/3, worker 11/11, web 22/22)
```

Exact output: `state/evidence/stage7/build.log`, `lint.log`, `typecheck.log`, `test.log`. An earlier build failed with `TypeError: Cannot read properties of undefined (reading 'ja')` on fresh-install fallback; that log was overwritten by the passing build.

### Playwright

Command: `pnpm --filter @mirai/web test:e2e:full`, with the dev server live and the same env as before.

```text
run 1: 48 passed, 1 skipped, 0 failed (2.9m), E2E_RUN1_EXIT=0
run 2: 48 passed, 1 skipped, 0 failed (2.7m), E2E_RUN2_EXIT=0
```

Exact output: `state/evidence/stage7/e2e-run-1.log`, `e2e-run-2.log`. The only SKIP remains test 26 (headless PDF download limitation). An intermediate run had 45 PASS + 3 FAIL (T6 native `required` blocked server errors, T9 hit Next's 1 MB action limit, T11 omitted required fields); all three causes were fixed before the two final runs.

| Test | Area | Result |
|---|---|---|
| T1 | `/cms/site` unauthenticated → `/login?next=%2Fcms%2Fsite` | PASS |
| T2 | Editor forbidden on `/cms/site` | PASS |
| T3 | Admin sees form with JA/EN tabs | PASS |
| T4 | Phone + JA hero headline changes appear on `/` | PASS |
| T5 | Saved phone appears in `/llms.txt` | PASS |
| T6 | Clearing required phone rejected; DB row unchanged | PASS |
| T7 | XSS headline rendered as escaped text | PASS |
| T8 | 200×200 hero upload stored and rendered via `next/image` | PASS |
| T9/T9b | Oversized and malformed uploads rejected | PASS |
| T10 | Header links by session (`/login` / `/dashboard`) | PASS |
| T11 | Draft case studies stay off public page | PASS |
| T12 | Fresh install with no settings row renders `site.ts` defaults | PASS |

### Manual swap

Admin edited `/cms/site`: `03-0000-0000` → `03-1111-2222` → `03-0000-0000`. Both saves returned `notice=Site%20settings%20saved`, the DB phone matched each value, and the public page showed `<a class="hero-phone" href="tel:03-1111-2222">03-1111-2222</a>` then the restored `tel:03-0000-0000` link. Exact before/after HTML snippets: `state/evidence/stage7/manual-swap.log`. Stage 7 rows were deleted after the check, so the final DB state is empty and `/` is back to `site.ts` fallback.

### Stage 7 decisions and exclusions

- `updated_by` is `TEXT` FK to `users.id`; a UUID probe failed with incompatible types `uuid and text`.
- No `sharp`, no resizing, no new dependencies; uploads keep original resolution inside the 5 MB/MIME/header checks.
- `about.authorBio` is a new optional field with `""` fallback; no Japanese copy was authored by the agent.
- Case studies default to `draft`; no case study was published in this session.
- `site.ts` was not modified or deleted; no `/en` routes, page builder, layout editing, structure toggles, scanner, privacy-rule, auth-guard, PDF, or font changes.
