import assert from "node:assert/strict";
import test from "node:test";
import { addTombstone, isTombstoned, tombstoneDigest } from "./erasure.js";
import type { QueryClient } from "./types.js";

const SECRET = "test-secret-value";

function fakeClient(matching: Set<string>) {
  const calls: { sql: string; values: unknown[] }[] = [];
  const client: QueryClient = {
    query: async (sql, values = []) => {
      calls.push({ sql, values });
      return { rows: sql.startsWith("SELECT") && matching.has(String(values[0])) ? [{ one: 1 }] : [] };
    },
  };
  return { client, calls };
}

test("tombstone digest is deterministic and contains no plaintext", () => {
  const first = tombstoneDigest("domain", "example.co.jp", SECRET);
  assert.equal(first, tombstoneDigest("domain", "example.co.jp", SECRET));
  assert.notEqual(first, tombstoneDigest("phone", "example.co.jp", SECRET));
  assert.notEqual(first, tombstoneDigest("domain", "example.co.jp", "other-secret"));
  assert.equal(first.includes("example"), false);
  assert.match(first, /^[0-9a-f]{64}$/);
});

test("tombstone write stores the digest only", async () => {
  const { client, calls } = fakeClient(new Set());
  const digest = await addTombstone(client, "domain", "example.co.jp", SECRET);
  assert.equal(digest, tombstoneDigest("domain", "example.co.jp", SECRET));
  assert.deepEqual(calls[0]?.values, [digest]);
});

test("tombstone lookup matches only the same key", async () => {
  const digest = tombstoneDigest("phone", "81312345678", SECRET);
  const { client } = fakeClient(new Set([digest]));
  assert.equal(await isTombstoned(client, "phone", "81312345678", SECRET), true);
  assert.equal(await isTombstoned(client, "phone", "81399999999", SECRET), false);
});
