import assert from "node:assert/strict";
import test from "node:test";
import { cooldownMessage } from "@mirai/db";
import { normalizeScanKind } from "./scans.js";

test("scan kind accepts only scan and detail", () => {
  assert.equal(normalizeScanKind("scan"), "scan");
  assert.equal(normalizeScanKind("detail"), "detail");
  assert.equal(normalizeScanKind("deep"), null);
  assert.equal(normalizeScanKind(undefined), null);
});

test("manual cooldown message is explicit", () => {
  assert.equal(cooldownMessage(4), "scan ran recently; wait 4 minutes");
});
