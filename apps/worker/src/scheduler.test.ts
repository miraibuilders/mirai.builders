import assert from "node:assert/strict";
import test from "node:test";
import { chooseScheduledLeads } from "./scheduler.js";

const now = new Date("2026-11-22T12:00:00.000Z");
const stale = new Date("2026-11-21T10:00:00.000Z");
const fresh = new Date("2026-11-22T11:30:00.000Z");

test("scheduler chooses only stale leads with website urls", () => {
  const result = chooseScheduledLeads(
    [
      { id: "a", websiteUrl: "https://example.jp/", latestScanAt: stale },
      { id: "b", websiteUrl: "https://fresh.jp/", latestScanAt: fresh },
      { id: "c", websiteUrl: "https://www.example.jp/about", latestScanAt: stale },
    ],
    new Set(),
    new Set(),
    now,
    24,
  );

  assert.deepEqual(result.chosen.map((item) => item.id), ["a"]);
  assert.equal(result.skippedCooldown, 1);
  assert.equal(result.skippedDuplicates, 0);
});

test("scheduler skips active leads and domains in recent cooldown", () => {
  const result = chooseScheduledLeads(
    [
      { id: "a", websiteUrl: "https://active.jp/", latestScanAt: stale },
      { id: "b", websiteUrl: "https://cooled.jp/", latestScanAt: stale },
      { id: "c", websiteUrl: "https://other.jp/", latestScanAt: stale },
    ],
    new Set(["a"]),
    new Set(["cooled.jp"]),
    now,
    24,
  );

  assert.deepEqual(result.chosen.map((item) => item.id), ["c"]);
  assert.equal(result.skippedDuplicates, 1);
  assert.equal(result.skippedCooldown, 1);
});
