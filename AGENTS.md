# MIRAI Lab — Agent Operating Contract

## Project

One Next.js App Router monorepo. Public marketing site, document engine,
passive scanner, CRM, and custom CMS. Postgres. Gotenberg for PDF.
Zero paid SaaS. AWS Tokyo or a free host; Cloudflare in front.

## Build and verify

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
  Every stage ends only when `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

## Hard rules

- Do not regenerate files that already exist. Output only new or changed files.
- Do not add paid services, paid SDKs, or paid APIs.
- Do not extract personal names, emails, or phone numbers anywhere in the scanner.
- Do not touch files outside the current stage's scope.
- Japanese UI text is written by Mika, not generated. Use placeholders if copy is missing.
- Every PDF template embeds Noto Sans JP locally. Never fetch fonts at render time.

## Handoff

Before writing code, read `state/handoff.md` and restate the current state,
what is in scope, and what is out of scope. After finishing, overwrite
`state/handoff.md` with: changed files, decisions made, checks run, known risks.
