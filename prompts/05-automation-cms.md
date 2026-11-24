Read AGENTS.md, docs/00-master-spec.md, and state/handoff.md.
This is stage 5 of 6.

Goal: scheduled scanning, manual re-run, detail analysis, and the custom CMS.
Do not build the blog frontend yet.

Deliver:

1. A cron trigger that enqueues a scan for every lead with a website URL,
   with a per-domain cooldown.
2. A manual re-run button on the lead detail page.
3. An "analyse in detail" button that enqueues one deeper scan and produces
   an internal Markdown brief, not a client-facing PDF.
4. CMS models: `posts`, `authors`, media upload to local disk, draft/publish,
   and roles admin/editor/viewer.
5. An admin UI where any editor can create and publish a post.
6. `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.

When done, overwrite state/handoff.md.
