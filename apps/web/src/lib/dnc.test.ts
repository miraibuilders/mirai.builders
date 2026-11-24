import assert from "node:assert/strict";
import test from "node:test";
import { isDncKind, normalizeDncValue } from "./dnc";

test("DNC kinds accept only the database enum values", () => {
  assert.equal(isDncKind("domain"), true);
  assert.equal(isDncKind("name_key"), true);
  assert.equal(isDncKind("email"), false);
});

test("DNC values normalize to the same keys used by the scanner", () => {
  assert.equal(normalizeDncValue("corporate_number", "１２３４５６７８９０１２３"), "1234567890123");
  assert.equal(normalizeDncValue("domain", "https://www.Example.jp/contact"), "example.jp");
  assert.equal(normalizeDncValue("phone", "090-1234-5678"), "819012345678");
  assert.equal(normalizeDncValue("name_key", "株式会社　サンプル"), "さんぷる");
});

test("DNC values reject unsupported formats", () => {
  assert.equal(normalizeDncValue("corporate_number", "123"), null);
  assert.equal(normalizeDncValue("domain", "not a domain"), null);
  assert.equal(normalizeDncValue("phone", "123"), null);
  assert.equal(normalizeDncValue("name_key", "   "), null);
});
