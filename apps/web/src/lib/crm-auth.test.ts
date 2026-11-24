import assert from "node:assert/strict";
import test from "node:test";
import { canEnqueueScan } from "./crm-auth";

test("scan API authorization allows only admin and editor roles", () => {
  assert.equal(canEnqueueScan(null), false);
  assert.equal(canEnqueueScan(undefined), false);
  assert.equal(canEnqueueScan("user"), false);
  assert.equal(canEnqueueScan("viewer"), false);
  assert.equal(canEnqueueScan("editor"), true);
  assert.equal(canEnqueueScan("admin"), true);
});
