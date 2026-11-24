Read AGENTS.md, docs/00-master-spec.md, docs/01-examples.md, and state/handoff.md.
This is stage 3 of 6.

Goal: build the document engine and one PDF pipeline.
Do not build the scanner or the CRM pipeline yet.

Deliver:

1. `DocumentTemplate` model with `branded` and `mono` variants.
   Branded uses CSS variables; mono uses black on white and simplified borders.
2. `Document` model for invoice, quote, NDA, and acceptance, with nullable
   `lead_id` and `registration_number`.
3. One HTML→PDF route that calls Gotenberg, with Noto Sans JP embedded.
4. A document creation form in `(app)` where the variant is selectable,
   defaulting to the lead's `preferred_template`.
5. One unit test that renders both variants and asserts the PDF is non-empty.
6. `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

Do not add freee or any paid invoicing service.
When done, overwrite state/handoff.md.
