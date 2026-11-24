import assert from "node:assert/strict";
import test from "node:test";
import { addDncEntry, isAnyDncBlocked, isDncBlocked, normalizeDncValue } from "./dnc.js";
import type { QueryClient } from "./types.js";

function fakeClient(blocked: Set<string>) {
  const calls: { sql: string; values: unknown[] }[] = [];
  const client: QueryClient = {
    query: async (sql, values = []) => {
      calls.push({ sql, values });
      if (sql.startsWith("SELECT")) {
        return { rows: blocked.has(String(values[1])) ? [{ one: 1 }] : [] };
      }
      return { rows: [] };
    },
  };
  return { client, calls };
}

test("normalise DNC values by key kind", () => {
  assert.equal(normalizeDncValue("corporate_number", "501-0401-00048-5"), "5010401000485");
  assert.equal(normalizeDncValue("domain", "https://www.example.co.jp/x"), "example.co.jp");
  assert.equal(normalizeDncValue("phone", "03-1234-5678"), "81312345678");
  assert.equal(normalizeDncValue("name_key", "株式会社ミライ"), "みらい");
});

test("DNC lookup returns blocked for a known key", async () => {
  const { client, calls } = fakeClient(new Set(["81312345678"]));
  assert.equal(await isDncBlocked(client, "phone", "03-1234-5678"), true);
  assert.equal(calls[0]?.values[0], "phone");
  assert.equal(calls[0]?.values[1], "81312345678");
  assert.equal(await isDncBlocked(client, "phone", "03-9999-9999"), false);
});

test("any-key DNC check stops at the first block", async () => {
  const { client, calls } = fakeClient(new Set(["example.co.jp"]));
  assert.equal(
    await isAnyDncBlocked(client, [
      { kind: "corporate_number", value: "5010401000485" },
      { kind: "domain", value: "https://www.example.co.jp/" },
      { kind: "name_key", value: "ミライ" },
    ]),
    true,
  );
  assert.equal(calls.length, 2);
});

test("DNC insert stores the normalised key", async () => {
  const { client, calls } = fakeClient(new Set());
  const normalised = await addDncEntry(client, {
    kind: "phone",
    value: "03-1234-5678",
    reason: "opt-out",
    origin: "request",
  });
  assert.equal(normalised, "81312345678");
  assert.equal(calls[0]?.values[1], "81312345678");
  assert.equal(calls[0]?.values[3], "request");
});
