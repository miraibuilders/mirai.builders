# MIRAI Lab — Master Specification

## Positioning

Outsourced engineering department for Japanese small businesses with aging
systems. Calm, careful, local, competent. Not a startup, not a cyber-security firm.
Entry offer: ¥29,800 External Check, credited against follow-up work.

## Stack

- Next.js App Router, TypeScript, one monorepo.
- Postgres as database AND job queue (`FOR UPDATE SKIP LOCKED`).
- Gotenberg (Docker) for HTML→PDF. One pipeline for reports and documents.
- Auth: Better Auth, self-hosted, roles: admin / editor / viewer.
- Custom CMS: Posts, Authors, Media, draft/publish. No page builder.
- Worker: separate Node process that claims scan jobs from Postgres.

## Route groups

- `(marketing)` — public, SSG/ISR. Landing, pricing, case studies, blog.
- `(app)` — authenticated console. Dashboard, leads, documents, settings.
- `/api` — scanner triggers, PDF render, auth callbacks.

## Data model (initial)

- `leads`: company, website_url, segment, score, stage, pain_flags, last_contact,
  next_step, next_step_date, preferred_template (nullable).
- `scans`: lead_id, status (queued/running/done/failed), result_json, created_at.
- `documents`: type (invoice/quote/nda/acceptance), lead_id (nullable),
  partner_name, issue_date, due_date, tax_breakdown, registration_number
  (nullable), line_items, template_variant (branded|mono).
- `posts`: title, slug, body_md, author_id, published_at, seo_fields.
- `users`: email, role.

## Scanner boundary (hard)

Reads only: HTTP response headers, meta tags, TLS certificate fields, DNS records
(SPF/DKIM/DMARC), cookie names, and publicly visible paths for `.git`, `.env`,
and backup files.
Never parses, stores, or logs body text, form fields, names, emails, or phones.
No POST requests, no forced errors, no directory brute-forcing.

## Scoring (100 points)

- Technical decay 40: EOL PHP +15, old CMS +10, no DMARC +5,
  expired TLS +5, exposed .git/.env +5.
- Segment fit 25.
- Reachability 20: referral 20, Mika network 15, cold 5.
- Website presence 10.
- Size proxy 5.
  Thresholds: A 80+, B 60–79, C 40–59, Reject <40.
  Weights live in one config object.

## Documents

Two variants: `branded` (CSS variables for indigo/vermilion palette) and `mono`
(black on white, simplified borders). Variant is selectable per document, with
the lead's `preferred_template` pre-selected but overridable.
Every invoice includes: issuer name, T+13 registration number (nullable),
transaction date, description, per-rate tax breakdown, recipient name,
invoice number.

## SEO

SSR for all marketing pages. JSON-LD for Article and FAQPage.
`sitemap.xml`, `robots.txt`, and `llms.txt` allow GPTBot, ClaudeBot,
PerplexityBot. Bing Webmaster verification and IndexNow ping on publish.

## Out of scope for the first six stages

freee integration, email sync, marketing automation, mobile app,
self-service client portal, WYSIWYG page builder.
