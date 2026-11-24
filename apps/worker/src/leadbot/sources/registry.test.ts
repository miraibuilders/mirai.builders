import assert from "node:assert/strict";
import test from "node:test";
import { SourceRegistry } from "./registry.js";
import type { SourceAdapter, SourceRepository } from "./types.js";

function fakeRepository(options: { snapshotExists?: boolean } = {}) {
  const enabled: string[] = [];
  const repository: SourceRepository = {
    termsSnapshotExists: async () => options.snapshotExists ?? true,
    enable: async (source, termsSnapshotId) => {
      enabled.push(`${source}:${termsSnapshotId}`);
    },
    getEnabled: async () => false,
  };
  return { repository, enabled };
}

test("html adapters are rejected by the registry", () => {
  const { repository } = fakeRepository();
  const registry = new SourceRegistry(repository);
  assert.throws(
    () =>
      registry.registerAdapter({
        source: "nta",
        type: "html",
        label: "scraper",
      } as unknown as SourceAdapter),
    /HTML_ADAPTER_REJECTED/,
  );
  assert.equal(registry.listAdapters().length, 0);
});

test("valid published-file and api adapters register", () => {
  const { repository } = fakeRepository();
  const registry = new SourceRegistry(repository);
  registry.registerAdapter({ source: "nta", type: "published_file", label: "NTA bulk" });
  registry.registerAdapter({ source: "gbiz", type: "api", label: "gBizINFO" });
  assert.equal(registry.listAdapters().length, 2);
  assert.throws(
    () => registry.registerAdapter({ source: "nta", type: "api", label: "duplicate" }),
    /DUPLICATE_ADAPTER/,
  );
});

test("a source cannot be enabled without an existing terms snapshot", async () => {
  const { repository, enabled } = fakeRepository({ snapshotExists: false });
  const registry = new SourceRegistry(repository);
  await assert.rejects(
    () => registry.enableSource("nta", "snapshot-1"),
    /TERMS_SNAPSHOT_NOT_FOUND/,
  );
  await assert.rejects(() => registry.enableSource("nta", ""), /TERMS_SNAPSHOT_REQUIRED/);
  assert.deepEqual(enabled, []);
});

test("a source with a terms snapshot can be enabled", async () => {
  const { repository, enabled } = fakeRepository({ snapshotExists: true });
  const registry = new SourceRegistry(repository);
  await registry.enableSource("gbiz", "snapshot-2");
  assert.deepEqual(enabled, ["gbiz:snapshot-2"]);
});
