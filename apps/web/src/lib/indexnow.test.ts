import assert from "node:assert/strict";
import test from "node:test";
import { pingIndexNow } from "./indexnow";

test("indexnow disabled path skips fetch and logs indexnow: disabled", async () => {
  const previousEnabled = process.env.INDEXNOW_ENABLED;
  const previousFetch = globalThis.fetch;
  const originalLog = console.log;
  const logs: string[] = [];
  let fetchCalls = 0;

  process.env.INDEXNOW_ENABLED = "false";
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("fetch must not be called when INDEXNOW_ENABLED is false");
  }) as typeof fetch;
  console.log = (...values: unknown[]) => {
    logs.push(values.map(String).join(" "));
  };

  try {
    const result = await pingIndexNow(["https://example.test/blog/post"]);
    assert.equal(result.skipped, true);
    assert.equal(fetchCalls, 0);
    assert.ok(logs.includes("indexnow: disabled"), `missing disabled log: ${JSON.stringify(logs)}`);
  } finally {
    console.log = originalLog;
    globalThis.fetch = previousFetch;
    if (previousEnabled === undefined) delete process.env.INDEXNOW_ENABLED;
    else process.env.INDEXNOW_ENABLED = previousEnabled;
  }
});
