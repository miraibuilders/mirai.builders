import assert from "node:assert/strict";
import test from "node:test";
import {
  cooldownMessage,
  cooldownRemainingMinutes,
  intervalHoursFromEnv,
  intervalMsFromHours,
  isInCooldown,
  normalizeDomain,
} from "./scan-policy.js";

test("normalizes domains for per-domain cooldown", () => {
  assert.equal(normalizeDomain("https://www.Example.jp/path?q=1"), "example.jp");
  assert.equal(normalizeDomain("http://example.jp:8080/"), "example.jp");
  assert.equal(normalizeDomain("not a url"), null);
});

test("interval env falls back to 24 hours", () => {
  assert.equal(intervalHoursFromEnv(undefined), 24);
  assert.equal(intervalHoursFromEnv(""), 24);
  assert.equal(intervalHoursFromEnv("bad"), 24);
  assert.equal(intervalHoursFromEnv("0"), 24);
  assert.equal(intervalHoursFromEnv("0.01"), 0.01);
  assert.equal(intervalMsFromHours(0.01), 36000);
});

test("manual cooldown reports whole minutes remaining", () => {
  const now = new Date("2026-11-22T00:15:00.000Z");
  const last = new Date("2026-11-22T00:06:30.000Z");
  assert.equal(isInCooldown(last, now), true);
  assert.equal(cooldownRemainingMinutes(last, now), 7);
  assert.equal(cooldownMessage(7), "scan ran recently; wait 7 minutes");
  assert.equal(isInCooldown(new Date("2026-11-22T00:00:00.000Z"), now), false);
});
