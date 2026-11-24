Read AGENTS.md, docs/00-master-spec.md, and state/handoff.md.
This is stage 6 of 6.

Goal: ship the blog frontend and the indexing pipeline.

Deliver:

1. `/blog` and `/blog/[slug]` with SSR and JSON-LD Article.
2. Per-post FAQ JSON-LD if the post has an FAQ block.
3. Bing Webmaster verification file and IndexNow key at `/{key}.txt`.
4. On publish, POST to `https://api.indexnow.org/indexnow` with host, key,
   keyLocation, and urlList.
5. A check that the key file is reachable and the POST returns 200/202.
6. Final verification: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
7. Overwrite state/handoff.md with the final state.

When done, the first six stages are complete. Do not start new features.
