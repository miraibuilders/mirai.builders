# Bilingual Landing Port Handoff — zip landing into MIRAI Lab

Date: 2026-11-24. The Demo Data Handoff was read first. The user approved the implementation plan with `go`. Work is complete and verified. No git repository exists and no commit was made.

## Current state

- The public root page is now the full bilingual landing experience ported from `/home/morpheus/Downloads/untitled (1).zip`, rewritten from Tailwind to plain CSS using app tokens.
- Public shell (header, mobile drawer, footer, sticky CTA, language switch) is shared by `/`, `/blog`, `/blog/[slug]`, and the four legal pages.
- Japanese is the SSR default. Switching to English is client-side via `localStorage["mirai-locale"]`; there are no `/en` routes.
- CMS site settings still drive phone, email, address, hero headline/subheadline/CTA/image, pricing, case studies, and footer copyright.
- Contact form keeps the `contact_requests` schema, server action export, and field names. Topic, website URL, and consent are folded into the stored `message`.
- Dev server is live on `:3000` (`ROOT_HTTP=200`). Postgres remains on `127.0.0.1:5433/mirai_lab`.
- Runtime env unchanged: `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/mirai_lab`, `BETTER_AUTH_SECRET=local-dev-mirai-lab-secret`, `BETTER_AUTH_URL=http://localhost:3000`, `SITE_ORIGIN=http://localhost:3000`, `INDEXNOW_ENABLED=true`, `INDEXNOW_ENDPOINT=http://127.0.0.1:4010/indexnow`, `INDEXNOW_KEY=dev-indexnow-key-9f3a1c7b`. pnpm shim: `/tmp/opencode/bin/pnpm`.
- Final DB state is restored to demo data: leads `14`, activities `21`, scans `14`, contacts `7`, documents `6`, posts `7`, authors `3`, media `4`, DNC `5`, site settings `1`.
- Logs and screenshots: `state/evidence/landing/`.

## In scope (completed)

- Replaced the root marketing page with hero, problems, reasons, services, pricing, flow, commitments, case studies, FAQ, company, and contact sections.
- Added production bilingual JA/EN copy for every landing section and four legal documents: privacy, terms, tokushoho, and security policy.
- Added a shared marketing shell with sticky header, mobile drawer, skip link, scroll progress, English/Japanese switch, footer, and mobile sticky CTA.
- Rewired the existing account link to the shared shell while preserving `a.marketing-account-link`.
- Preserved CMS-driven blog and site settings; added `id="main-content"` to blog pages for the shared skip link.
- Rebuilt the contact form with localized labels, topic select, website URL field, consent checkbox, honeypot, client validation, and server-action feedback.
- Updated JSON-LD to stay placeholder-free and reflect the merged CMS content.
- Fixed a 390px header overflow found during screenshot verification by hiding nonessential header CTAs on small screens.

## Out of scope (not built or altered)

- No zip `/admin` routes, static zip blog pages, zip OG image templates, or zip sitemap/robots/manifest files were ported.
- No scanner, PDF pipeline, auth guard, schema, migration, dependency, or paid service changes.
- No Tailwind or heavy component library.
- No extraction of personal names, emails, or phone numbers from scanned sites.
- No commit and no git command beyond earlier read-only status/identity checks.

## Changed files

- `apps/web/src/content/site.ts` — production JA/EN defaults replaced all `[MIKA: ...]` placeholders; default phone `03-5555-0188`; hero default aligned with demo/CMS copy.
- `apps/web/src/features/landing/types.ts` — new landing content and legal document types.
- `apps/web/src/features/landing/validation.ts` — new client contact validation.
- `apps/web/src/features/landing/landing.css` — new plain-CSS landing system mapped to app tokens with 3px focus rings.
- `apps/web/src/features/landing/content/ja.ts` — production Japanese landing copy.
- `apps/web/src/features/landing/content/en.ts` — production English landing copy.
- `apps/web/src/features/landing/content/legal.ts` — bilingual legal documents.
- `apps/web/src/features/landing/content/index.ts` — content builder for merged CMS data.
- `apps/web/src/features/landing/components/landing-provider.tsx` — locale context and persistence.
- `apps/web/src/features/landing/components/brand-mark.tsx` — inline gradient M mark.
- `apps/web/src/features/landing/components/site-header.tsx` — shared public header.
- `apps/web/src/features/landing/components/mobile-menu.tsx` — mobile drawer.
- `apps/web/src/features/landing/components/sticky-action-bar.tsx` — mobile call/contact bar.
- `apps/web/src/features/landing/components/site-footer.tsx` — shared public footer.
- `apps/web/src/features/landing/components/legal-page-view.tsx` — shared legal page renderer.
- `apps/web/src/features/landing/components/subpage-frame.tsx` — optional subpage frame.
- `apps/web/src/features/landing/components/contact-form.tsx` — new localized form.
- `apps/web/src/features/landing/components/landing-sections.tsx` — full landing section composition.
- `apps/web/src/app/(marketing)/layout.tsx` — loads merged site content and renders the shared shell.
- `apps/web/src/app/(marketing)/page.tsx` — new landing page and JSON-LD.
- `apps/web/src/app/(marketing)/actions.ts` — folds topic/website/consent into `message`; keeps field names and action export.
- `apps/web/src/app/(marketing)/_components/account-link.tsx` — localized dashboard/login label.
- `apps/web/src/app/(marketing)/blog/page.tsx` — added main landmark id.
- `apps/web/src/app/(marketing)/blog/[slug]/page.tsx` — added main landmark id.
- `apps/web/src/app/(marketing)/privacy/page.tsx` — new legal route.
- `apps/web/src/app/(marketing)/terms/page.tsx` — new legal route.
- `apps/web/src/app/(marketing)/tokushoho/page.tsx` — new legal route.
- `apps/web/src/app/(marketing)/security-policy/page.tsx` — new legal route.
- `apps/web/tests/full-system.spec.ts` — updated expectations for new copy, contact fields, scoped blog markdown assertions, case-studies anchor, and production defaults.
- `state/evidence/landing/*` — build, lint, typecheck, unit, E2E, seed logs and 7 screenshots.
- `state/handoff.md` — this handoff.

## Decisions

1. Ported only the root landing, public shell, and legal pages. The existing CMS-driven blog, OG images, sitemap, auth, and DB schema were kept.
2. Japanese copy was drafted for Mika approval as the user requested; no visible draft markers or TODO tokens remain.
3. Business facts use current CMS/demo values: phone `03-5555-0188`, email `contact@example.jp`, address `東京都中央区日本橋1-2-3 4F` / `1-2-3 Nihonbashi, Chuo-ku, Tokyo`, representative `ミライラボ 代表` / `MIRAI Lab`.
4. Inferred review values are embedded for hours `平日 9:00〜18:00`, service area `日本全国（オンライン中心）・東京都中央区`, process durations, policy date `2026-11-24`, jurisdiction `東京地方裁判所`, and pricing labels from current defaults.
5. The zip logo PNG was not copied. `BrandMark` uses an inline gradient `M` mark instead, avoiding an extra 1.9MB binary asset.
6. Zip brand colors were preserved as role tokens, but layout spacing, radius, focus, and typography were mapped to the existing app design system. Focus remains 3px, not the zip's 2px.
7. Contact validation now requires topic and consent in addition to the existing required fields. Server validation also rejects missing topic or consent.
8. Contact storage remains schema-compatible: `Topic: ...`, optional `Website: ...`, and `Consent: agreed` are appended to the original message.
9. CMS hero headline, subheadline, CTA, and image are consumed by the landing content builder. The h1 splits on `、` or `, ` for the gradient second line and has an `aria-label` containing the full headline so raw HTML assertions still pass.
10. E2E assertions were updated without weakening coverage: contact submission now selects a topic and checks consent, blog markdown assertions are scoped to `.blog-body`, and default/no-settings expectations now require production copy and no `[MIKA:`.
11. Full E2E can now run against the demo DB because test 2 expects the production default phone, which matches the demo value. The final demo seed is still applied last.

## Checks run (exact output)

```
$ pnpm typecheck                                      → Done
  packages/db, apps/web, apps/worker: no errors
$ pnpm lint                                           → LINT_EXIT=0
  apps/web: No ESLint warnings or errors
$ pnpm build                                          → BUILD_EXIT=0
  Next.js 15.5.29, compiled successfully, 7/7 static pages
$ pnpm test                                           → TEST_EXIT=0
  packages/db: 3 pass, 0 fail
  apps/worker: 33 pass, 0 fail
  apps/web: 28 pass, 0 fail
$ pnpm --filter @mirai/web test:e2e:full              → E2E_FULL_EXIT=0
  1 skipped, 73 passed (5.7m)
$ pnpm seed:demo                                      → SEED_DEMO_EXIT=0
  leads 14, activities 21, scans 14, contacts 7,
  documents 6, posts 7, authors 3, media 4, dnc 5
$ curl http://localhost:3000/                         → ROOT_HTTP=200
$ DB final check                                      → site_settings=1, test_leads=0
$ Screenshot verification                             → 8 screenshots captured
  home-ja-desktop, home-en-desktop, home-ja-mobile,
  home-menu-mobile, privacy, terms, tokushoho,
  security-policy under state/evidence/landing/screens/
```

## Known risks / follow-ups

- Mika must approve the drafted Japanese landing and legal copy. Inferred business/legal values should be verified before production.
- `JSON-LD.foundingDate` still follows the old implementation and uses `site.year` (current year). A real founding date should be added to settings in a future stage if required.
- English is client-side only: no `/en` routes, hreflang, or English SEO metadata were added.
- The mobile header hides its primary CTA below 480px; the sticky bottom bar still provides contact access.
- The hidden `renderedAt` field is present but not enforced server-side; honeypot and required-field validation are enforced.
- Blog pages keep their existing visual styling while sharing the new public header/footer.
- `seed:demo` is destructive to local business tables and should never be run against production-like data.
- No git repository exists, so no commit, branch, or PR was created.

## Next stage

Read this handoff first. Verify Japanese copy with Mika, confirm inferred legal/business values, and decide whether English needs dedicated routes and SEO metadata.
