Read AGENTS.md, docs/00-master-spec.md, and state/handoff.md.
This is stage 2 of 6.

Goal: build the public landing page inside `(marketing)`.
Do not touch the database schema or the app console.

Deliver:

1. `/` with placeholders for Mika's name, photo, phone, the ¥29,800 check,
   price list, three case studies, and a contact form.
2. Contact form that writes to a `contact_requests` table.
3. SSR or ISR for the landing page. LCP < 2.5s, INP < 200ms, CLS < 0.15.
4. JSON-LD for the organisation and the service.
5. `sitemap.ts`, `robots.ts`, and `llms.txt` with AI crawlers allowed.
6. `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

Use CSS variables for colours; the designer will supply values later.
When done, overwrite state/handoff.md.
